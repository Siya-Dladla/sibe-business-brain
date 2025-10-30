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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
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

    const { forecastType, timeHorizon, businessData } = await req.json();

    console.log('Generating forecast:', { forecastType, timeHorizon });

    // Get business metrics for context
    const { data: metrics } = await supabase
      .from('business_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const metricsContext = metrics?.map(m => 
      `${m.metric_name}: ${m.value} (${m.metric_type})`
    ).join(', ') || 'No historical data';

    const prompt = `As a business intelligence analyst, generate a detailed ${forecastType} forecast for the next ${timeHorizon}.

Business Context:
${businessData || 'General business analysis'}

Historical Metrics:
${metricsContext}

Provide:
1. Key predictions with confidence levels (0-100%)
2. Risk factors and opportunities
3. Actionable recommendations
4. Data-driven insights

Format as JSON with:
{
  "predictions": [{"metric": "...", "forecast": "...", "confidence": 85}],
  "risks": ["..."],
  "opportunities": ["..."],
  "recommendations": ["..."],
  "summary": "..."
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert business analyst specializing in forecasting and strategic planning.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const forecastData = JSON.parse(data.choices[0].message.content);

    // Save forecast to database
    const { data: forecast, error: insertError } = await supabase
      .from('forecasts')
      .insert({
        user_id: user.id,
        forecast_type: forecastType,
        title: `${forecastType} Forecast - ${timeHorizon}`,
        description: forecastData.summary,
        predictions: forecastData,
        confidence_score: forecastData.predictions?.[0]?.confidence || 75,
        time_horizon: timeHorizon,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('Forecast generated successfully:', forecast.id);

    return new Response(JSON.stringify({ forecast }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-forecast function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
