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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { reportType, periodStart, periodEnd } = await req.json();

    console.log('Generating report:', { reportType, periodStart, periodEnd });

    // Fetch all relevant data
    const [metricsResult, insightsResult, meetingsResult] = await Promise.all([
      supabase.from('business_metrics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('ai_insights').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('meetings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
    ]);

    const metricsData = metricsResult.data?.map(m => 
      `${m.metric_name}: ${m.value} ${m.metric_type} (${m.period})`
    ).join('\n') || 'No metrics data';

    const insightsData = insightsResult.data?.map(i => 
      `${i.title}: ${i.content}`
    ).join('\n') || 'No insights data';

    const meetingsData = meetingsResult.data?.map(m =>
      `${m.title}: ${m.summary || 'No summary'}`
    ).join('\n') || 'No meetings data';

    const prompt = `Generate a comprehensive ${reportType} business report for the period ${periodStart} to ${periodEnd}.

**Business Metrics:**
${metricsData}

**AI Insights:**
${insightsData}

**Recent Meetings:**
${meetingsData}

Create a detailed report with:
1. Executive Summary (3-4 paragraphs)
2. Key Performance Indicators Analysis
3. Strategic Insights and Trends
4. Opportunities and Risks
5. Actionable Recommendations
6. Conclusion

Write in a professional, data-driven style. Be specific and quantitative where possible.`;

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
          { role: 'system', content: 'You are an expert business analyst who creates comprehensive, data-driven reports.' },
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
    const reportContent = data.choices[0].message.content;

    // Extract summary (first paragraph)
    const summary = reportContent.split('\n\n')[0];

    // Save report to database
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        report_type: reportType,
        title: `${reportType} Report - ${new Date(periodStart).toLocaleDateString()} to ${new Date(periodEnd).toLocaleDateString()}`,
        content: reportContent,
        summary: summary,
        data: {
          metrics_count: metricsResult.data?.length || 0,
          insights_count: insightsResult.data?.length || 0,
          meetings_count: meetingsResult.data?.length || 0
        },
        period_start: periodStart,
        period_end: periodEnd,
        status: 'completed'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('Report generated successfully:', report.id);

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-report function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
