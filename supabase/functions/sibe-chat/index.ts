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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
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
    let context = "You are Sibe SI (Synthetic Intelligence Business Engine), an AI business partner that deeply understands the user's business.\n\n";
    
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

    console.log('Calling OpenAI with context:', context);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

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
