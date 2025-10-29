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
      `${m.metric_name}: ${m.value} (${m.change_percentage > 0 ? '+' : ''}${m.change_percentage.toFixed(1)}%)`
    ).join('\n') || 'No metrics available';

    const plansContext = plans?.map(p => 
      `${p.title}: ${p.description || 'No description'}`
    ).join('\n') || 'No business plans available';

    // Call OpenAI to generate insights
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI business intelligence assistant. Analyze the provided business metrics and generate 3-5 actionable insights. Keep insights concise and focused on specific recommendations.`
          },
          {
            role: 'user',
            content: `Based on these business metrics and plans, generate strategic insights:\n\nMetrics:\n${metricsContext}\n\nBusiness Plans:\n${plansContext}\n\nProvide 3-5 specific, actionable insights.`
          }
        ],
        max_tokens: 1500,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate insights');
    }

    const aiData = await openaiResponse.json();
    const insights = aiData.choices[0].message.content;
    console.log('AI Insights generated');

    // Store the insights
    const { data: savedInsight, error: insightsError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: user.id,
        insight_type: 'automated',
        title: 'AI-Generated Business Insights',
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