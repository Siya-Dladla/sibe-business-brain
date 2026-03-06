import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAiConfig(supabase: any, userId: string, lovableApiKey: string) {
  const { data } = await supabase
    .from('connected_agents')
    .select('api_endpoint, api_key_encrypted')
    .eq('user_id', userId)
    .eq('platform', 'openclaw')
    .eq('status', 'active')
    .maybeSingle();
  if (data?.api_endpoint && data?.api_key_encrypted) {
    let endpoint = data.api_endpoint;
    if (!endpoint.endsWith('/chat/completions')) endpoint = endpoint.replace(/\/$/, '') + '/chat/completions';
    return { endpoint, apiKey: data.api_key_encrypted, isOpenClaw: true };
  }
  return { endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions', apiKey: lovableApiKey, isOpenClaw: false };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { meetingTitle, agenda, participantIds } = await req.json();

    console.log('Creating AI meeting:', { meetingTitle, agenda });

    // Get AI employees for the meeting
    const { data: employees } = await supabase
      .from('ai_employees')
      .select('*')
      .eq('user_id', user.id)
      .in('id', participantIds || []);

    // Get recent business context
    const { data: insights } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: metrics } = await supabase
      .from('business_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const participantsContext = employees?.map(e => 
      `${e.name} (${e.role}, ${e.department})`
    ).join(', ') || 'SIBE AI';

    const businessContext = `
Recent Insights: ${insights?.map(i => i.title).join(', ') || 'None'}
Key Metrics: ${metrics?.map(m => `${m.metric_name}: ${m.value}`).join(', ') || 'None'}
`;

    const prompt = `You are facilitating an AI-powered strategic business meeting.

**Meeting Title:** ${meetingTitle}
**Agenda:** ${agenda}
**Participants:** ${participantsContext}

**Business Context:**
${businessContext}

Generate a comprehensive meeting summary that includes:
1. Opening remarks and context
2. Discussion of each agenda item with insights from different perspectives
3. Key decisions and action items
4. Strategic recommendations
5. Next steps and follow-up actions

Make it feel like a real strategic business meeting with multiple AI participants providing diverse insights. Keep it professional and actionable.`;

    const aiConfig = await getAiConfig(supabase, user.id, LOVABLE_API_KEY);
    console.log(`Calling AI via ${aiConfig.isOpenClaw ? 'OpenClaw' : 'Lovable AI Gateway'}`);

    const response = await fetch(aiConfig.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiConfig.isOpenClaw ? 'default' : 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert AI meeting facilitator who synthesizes diverse perspectives into actionable business strategies.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const error = await response.text();
      console.error('AI Gateway error:', error);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const meetingTranscript = data.choices[0].message.content;

    // Extract summary (first two paragraphs)
    const paragraphs = meetingTranscript.split('\n\n');
    const summary = paragraphs.slice(0, 2).join('\n\n');

    // Extract recommendations (look for bullet points or numbered lists)
    const recommendations = meetingTranscript.match(/(?:^|\n)[\d•\-*]\.\s+.+/gm)?.join('\n') || 'See full transcript for recommendations';

    // Save meeting to database
    const { data: meeting, error: insertError } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        title: meetingTitle,
        summary: summary,
        transcript: meetingTranscript,
        participants: employees?.map(e => e.name) || ['SIBE AI'],
        ai_recommendations: recommendations,
        duration_minutes: 30,
        status: 'completed',
        meeting_date: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('Meeting created successfully:', meeting.id);

    return new Response(JSON.stringify({ meeting }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[ai-meeting] error:', error);
    const message = error instanceof Error ? error.message : '';
    const isClientError = message === 'Unauthorized' || message.includes('required');
    return new Response(JSON.stringify({ error: isClientError ? message : 'An internal error occurred' }), {
      status: isClientError ? 400 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
