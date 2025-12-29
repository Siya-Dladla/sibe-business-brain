import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Generating AI insights for user:', user.id);

    // Fetch user's metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('business_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      throw metricsError;
    }

    // Fetch user's business plans
    const { data: plans, error: plansError } = await supabase
      .from('business_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (plansError) {
      console.error('Error fetching plans:', plansError);
      throw plansError;
    }

    const metricsContext = metrics?.map(m => 
      `${m.metric_name}: ${m.value} (${m.change_percentage > 0 ? '+' : ''}${m.change_percentage?.toFixed(1) || 0}%)`
    ).join('\n') || 'No metrics available';

    const plansContext = plans?.map(p => 
      `${p.title}: ${p.description || 'No description'}`
    ).join('\n') || 'No business plans available';

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
          {
            role: 'system',
            content: `You are Sibe SI (Synthetic Intelligence Business Engine), the living business brain that learns, thinks, and advises strategically. You deeply understand this business and think like a seasoned executive who has worked here for years.`
          },
          {
            role: 'user',
            content: `As Sibe SI, analyze this business data and provide 3-5 strategic insights that demonstrate your deep understanding:\n\nMetrics:\n${metricsContext}\n\nBusiness Plans:\n${plansContext}\n\nFocus on:\n1. Hidden patterns others miss\n2. Strategic opportunities\n3. Immediate risks\n4. Actionable next steps with measurable outcomes\n\nBe bold, specific, and strategic.`
          }
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
      throw new Error('Failed to generate insights');
    }

    const aiData = await response.json();
    const insights = aiData.choices[0].message.content;
    console.log('AI Insights generated');

    // Store the insights
    const { data: savedInsight, error: insightsError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: user.id,
        insight_type: 'automated',
        title: 'Sibe SI Strategic Analysis',
        content: insights
      })
      .select()
      .single();

    if (insightsError) {
      console.error('Error saving insights:', insightsError);
      throw insightsError;
    }

    console.log('Insights saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        insight: savedInsight
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
