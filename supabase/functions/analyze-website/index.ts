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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
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

    const { websiteUrl } = await req.json();

    if (!websiteUrl) {
      throw new Error('Website URL is required');
    }

    console.log('Fetching website:', websiteUrl);

    // Fetch the website content
    let websiteContent = '';
    try {
      const websiteResponse = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SibeSI/1.0; +https://sibe-si.com)'
        }
      });
      
      if (websiteResponse.ok) {
        websiteContent = await websiteResponse.text();
        // Extract text content from HTML (simple extraction)
        websiteContent = websiteContent
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 3000); // Limit to first 3000 chars
      }
    } catch (fetchError) {
      console.warn('Could not fetch website, will analyze URL only:', fetchError);
      websiteContent = `Unable to fetch website content. URL: ${websiteUrl}`;
    }

    console.log('Analyzing website with AI...');

    // Analyze with Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are Sibe SI, an expert business analyst. Analyze the website and provide:
1. Business model and revenue streams
2. Target audience and market positioning
3. Current strengths and weaknesses
4. Growth opportunities and scaling strategies
5. Specific actionable recommendations

Be detailed, specific, and strategic. Focus on practical insights for scaling.`
          },
          {
            role: 'user',
            content: `Analyze this business website:\n\nURL: ${websiteUrl}\n\nContent:\n${websiteContent}\n\nProvide a comprehensive analysis with scaling recommendations.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error('Failed to analyze website with AI');
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    // Extract recommendations (look for numbered lists or bullet points)
    const recommendations = [];
    const lines = analysis.split('\n');
    for (const line of lines) {
      if (line.match(/^\d+\./) || line.match(/^[-*•]/)) {
        const cleaned = line.replace(/^\d+\.\s*/, '').replace(/^[-*•]\s*/, '').trim();
        if (cleaned.length > 10) {
          recommendations.push(cleaned);
        }
      }
    }

    // Store the analysis
    const { data: analysisData, error: insertError } = await supabase
      .from('website_analyses')
      .insert({
        user_id: user.id,
        website_url: websiteUrl,
        analysis_content: analysis,
        recommendations: recommendations.slice(0, 10) // Top 10 recommendations
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing analysis:', insertError);
      throw insertError;
    }

    // Also create initial business metrics and insights based on the analysis
    const metricsPrompt = `Based on this business analysis:\n\n${analysis}\n\nGenerate 4 key business metrics with realistic current values and growth percentages. Format as JSON array with: metric_name, value, change_percentage, metric_type (revenue/customers/growth/operational)`;

    const metricsResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a business analyst. Return ONLY valid JSON array, no other text.' },
          { role: 'user', content: metricsPrompt }
        ],
      }),
    });

    if (metricsResponse.ok) {
      const metricsData = await metricsResponse.json();
      const metricsText = metricsData.choices[0].message.content;
      try {
        const metrics = JSON.parse(metricsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
        
        // Insert metrics
        for (const metric of metrics) {
          await supabase.from('business_metrics').insert({
            user_id: user.id,
            metric_name: metric.metric_name,
            value: metric.value,
            change_percentage: metric.change_percentage,
            metric_type: metric.metric_type,
            period: 'current'
          });
        }
      } catch (parseError) {
        console.warn('Could not parse metrics:', parseError);
      }
    }

    // Create an initial insight
    await supabase.from('ai_insights').insert({
      user_id: user.id,
      title: `Website Analysis: ${new URL(websiteUrl).hostname}`,
      content: analysis.substring(0, 500) + '...',
      insight_type: 'website_analysis'
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: analysisData 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in analyze-website function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
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
