import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { message } = await req.json();
    console.log('Processing chat message for user:', user.id);

    // Fetch user's business context
    const { data: metrics } = await supabase
      .from('business_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: insights } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    const { data: plans } = await supabase
      .from('business_plans')
      .select('title, description, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    // Build context for AI
    let context = "You are Sibe SI (Synthetic Intelligence Business Engine), an AI business partner that deeply understands the user's business. You provide strategic, actionable insights based on data.\n\n";
    
    if (plans && plans.length > 0) {
      context += `Business Context:\n${plans[0].title}: ${plans[0].description}\n\n`;
    }

    if (metrics && metrics.length > 0) {
      context += "Recent Business Metrics:\n";
      metrics.forEach(m => {
        context += `- ${m.metric_name}: ${m.value} (${m.change_percentage > 0 ? '+' : ''}${m.change_percentage}%)\n`;
      });
      context += "\n";
    }

    if (insights && insights.length > 0) {
      context += "Recent Strategic Insights:\n";
      insights.slice(0, 2).forEach(i => {
        context += `- ${i.title}: ${i.content.substring(0, 150)}...\n`;
      });
      context += "\n";
    }

    context += "Respond as a strategic business advisor who knows this business intimately. Be concise, actionable, and data-driven. Provide specific recommendations based on the business context.";

    console.log('Calling Lovable AI Gateway');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const error = await response.text();
      console.error('AI Gateway error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    console.log('AI response received successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in sibe-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
