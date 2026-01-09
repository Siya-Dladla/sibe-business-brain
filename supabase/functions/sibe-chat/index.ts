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

    const { message, businessContext } = await req.json();
    console.log('Processing chat message for user:', user.id);

    // Build context for AI based on current business data
    let context = "You are Sibe SI (Synthetic Intelligence Business Engine), an AI business partner. You ONLY answer based on the specific business data provided below. If no business data is available, politely ask the user to upload their business plan, connect their website, or add their business data first.\n\n";
    
    let hasBusinessData = false;

    // Include business plan/document context
    if (businessContext?.businessPlan) {
      hasBusinessData = true;
      const plan = businessContext.businessPlan;
      context += `=== CURRENT BUSINESS (from uploaded document) ===\n`;
      context += `Business Name: ${plan.title}\n`;
      if (plan.description) {
        context += `Description: ${plan.description}\n`;
      }
      if (plan.content) {
        context += `Business Details:\n${plan.content.substring(0, 3000)}\n`;
      }
      context += "\n";
    }

    // Include website analysis context
    if (businessContext?.websiteAnalysis) {
      hasBusinessData = true;
      const website = businessContext.websiteAnalysis;
      context += `=== WEBSITE ANALYSIS ===\n`;
      context += `Website: ${website.website_url}\n`;
      context += `Analysis:\n${website.analysis_content.substring(0, 2000)}\n`;
      if (website.recommendations) {
        context += `Recommendations: ${JSON.stringify(website.recommendations).substring(0, 500)}\n`;
      }
      context += "\n";
    }

    // Include metrics context
    if (businessContext?.metrics && businessContext.metrics.length > 0) {
      hasBusinessData = true;
      context += "=== CURRENT BUSINESS METRICS ===\n";
      businessContext.metrics.forEach((m: any) => {
        context += `- ${m.metric_name}: ${m.value}`;
        if (m.change_percentage !== null) {
          context += ` (${m.change_percentage > 0 ? '+' : ''}${m.change_percentage}% change)`;
        }
        if (m.period) {
          context += ` [${m.period}]`;
        }
        context += "\n";
      });
      context += "\n";
    }

    if (!hasBusinessData) {
      context += "NOTE: No business data has been uploaded yet. The user needs to:\n";
      context += "1. Upload a business plan/document, OR\n";
      context += "2. Analyze their website, OR\n";
      context += "3. Input their business metrics\n\n";
    }

    context += "IMPORTANT: Base ALL your responses on the specific business data provided above. Be concise, actionable, and reference the actual data when giving advice. If asked about something not in the data, explain what information would be needed.";

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
