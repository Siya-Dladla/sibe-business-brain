import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { workflowId } = await req.json();
    console.log('Executing workflow:', workflowId, 'for user:', user.id);

    // Fetch the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('ai_workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', user.id)
      .single();

    if (workflowError || !workflow) {
      throw new Error('Workflow not found');
    }

    // Create a workflow run record
    const { data: run, error: runError } = await supabase
      .from('workflow_runs')
      .insert({
        workflow_id: workflowId,
        user_id: user.id,
        status: 'running',
        logs: [],
      })
      .select()
      .single();

    if (runError) {
      throw new Error('Failed to create run record');
    }

    const logs: any[] = [];
    const nodes = workflow.nodes as any[];
    
    // Process nodes in order
    for (const node of nodes) {
      logs.push({ timestamp: new Date().toISOString(), node: node.id, status: 'processing' });
      
      try {
        if (node.type === 'ai_employee') {
          // Fetch employee data
          const { data: employee } = await supabase
            .from('ai_employees')
            .select('*')
            .eq('id', node.config.employeeId)
            .single();

          if (employee) {
            // Fetch business context
            const metricsResult = await supabase.from('business_metrics').select('*').eq('user_id', user.id).limit(10);
            const plansResult = await supabase.from('business_plans').select('*').eq('user_id', user.id).limit(1);

            const context = buildEmployeeContext(employee, metricsResult.data || [], plansResult.data || []);
            
            // Execute AI action based on downstream actions
            const actionNodes = nodes.filter(n => 
              n.type === 'action' && node.connections.includes(n.id)
            );

            for (const actionNode of actionNodes) {
              const actionResult = await executeAction(
                supabase,
                LOVABLE_API_KEY,
                user.id,
                employee,
                actionNode.config.actionType,
                context
              );
              
              logs.push({
                timestamp: new Date().toISOString(),
                node: actionNode.id,
                action: actionNode.config.actionType,
                result: actionResult,
              });
            }
          }
        }
      } catch (nodeError: any) {
        logs.push({
          timestamp: new Date().toISOString(),
          node: node.id,
          status: 'error',
          error: nodeError.message,
        });
      }
    }

    // Update workflow run
    await supabase
      .from('workflow_runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        logs,
      })
      .eq('id', run.id);

    // Update workflow run count
    await supabase
      .from('ai_workflows')
      .update({
        run_count: (workflow.run_count || 0) + 1,
        last_run_at: new Date().toISOString(),
      })
      .eq('id', workflowId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Workflow executed successfully',
        runId: run.id,
        logs 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[execute-workflow] error:', error);
    const message = error instanceof Error ? error.message : '';
    const isClientError = message === 'Unauthorized' || message.includes('not found');
    return new Response(
      JSON.stringify({ error: isClientError ? message : 'An internal error occurred' }),
      { status: isClientError ? 400 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildEmployeeContext(employee: any, metrics: any[], plans: any[]) {
  let context = `You are ${employee.name}, a ${employee.role} in the ${employee.department} department.\n`;
  
  if (employee.personality) {
    context += `Personality: ${employee.personality}\n`;
  }
  
  if (employee.expertise?.length > 0) {
    context += `Expertise: ${employee.expertise.join(', ')}\n`;
  }

  if (metrics?.length > 0) {
    context += '\n=== BUSINESS METRICS ===\n';
    metrics.forEach(m => {
      context += `- ${m.metric_name}: ${m.value}`;
      if (m.change_percentage !== null) {
        context += ` (${m.change_percentage > 0 ? '+' : ''}${m.change_percentage}%)`;
      }
      context += '\n';
    });
  }

  if (plans?.[0]?.content) {
    context += '\n=== BUSINESS CONTEXT ===\n';
    context += plans[0].content.substring(0, 2000) + '\n';
  }

  return context;
}

async function executeAction(
  supabase: any,
  apiKey: string,
  userId: string,
  employee: any,
  actionType: string,
  context: string
): Promise<any> {
  const actionPrompts: Record<string, string> = {
    analyze_data: 'Analyze the current business metrics and provide 3-5 key insights with actionable recommendations.',
    create_task: 'Based on the business data, suggest 3 priority tasks that should be created to improve business performance.',
    generate_report: 'Generate a comprehensive business report summarizing the current state and recommendations.',
    send_alert: 'Identify any concerning trends or issues that require immediate attention.',
    sync_data: 'Summarize what data should be synced and what integrations would be beneficial.',
  };

  const prompt = actionPrompts[actionType] || 'Analyze the data and provide insights.';

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: context },
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed: ${errorText}`);
  }

  const data = await response.json();
  const result = data.choices[0].message.content;

  // Store the result as an AI insight
  if (actionType === 'analyze_data' || actionType === 'generate_report') {
    await supabase.from('ai_insights').insert({
      user_id: userId,
      insight_type: actionType,
      title: `${employee.name}: ${actionType.replace('_', ' ')}`,
      content: result,
    });
  }

  return { action: actionType, content: result };
}
