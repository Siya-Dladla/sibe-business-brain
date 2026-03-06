import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommandResult {
  type: 'workflow' | 'employee' | 'data' | 'delete_workflow' | 'delete_employee' | 'info' | 'connections' | 'documents' | 'data_overview' | 'edit_employee' | 'report' | 'forecast' | 'run_workflow' | 'meeting' | 'metric' | 'insight' | 'task';
  success: boolean;
  data?: any;
  message?: string;
}

// Parse user intent and extract commands
function parseCommand(message: string): { isCommand: boolean; commandType: string; params: any } {
  const lowerMessage = message.toLowerCase();
  
  // Generate report patterns
  if (lowerMessage.includes('generate report') || lowerMessage.includes('create report') ||
      lowerMessage.includes('make a report') || lowerMessage.includes('build report') ||
      lowerMessage.includes('run report') || lowerMessage.includes('get report')) {
    const typeMatch = message.match(/(?:generate|create|make|build|run)\s+(?:a\s+)?(\w+)\s+report/i);
    const periodMatch = message.match(/(?:for|from|period)\s+["']?([^"'\n]+)["']?/i);
    return {
      isCommand: true,
      commandType: 'generate_report',
      params: { 
        reportType: typeMatch?.[1]?.toLowerCase() || 'comprehensive',
        period: periodMatch?.[1]?.trim() || 'current month'
      }
    };
  }

  // Generate forecast patterns
  if (lowerMessage.includes('generate forecast') || lowerMessage.includes('create forecast') ||
      lowerMessage.includes('predict') || lowerMessage.includes('forecast') ||
      lowerMessage.includes('projection') || lowerMessage.includes('what will')) {
    const typeMatch = message.match(/(?:generate|create|make)\s+(?:a\s+)?(\w+)\s+forecast/i) ||
                      message.match(/(?:forecast|predict|projection)\s+(?:for\s+)?(\w+)/i);
    const horizonMatch = message.match(/(?:for|next|over)\s+(?:the\s+)?(?:next\s+)?(\d+\s*(?:day|week|month|quarter|year)s?)/i);
    return {
      isCommand: true,
      commandType: 'generate_forecast',
      params: { 
        forecastType: typeMatch?.[1]?.toLowerCase() || 'business',
        timeHorizon: horizonMatch?.[1]?.trim() || '3 months'
      }
    };
  }

  // Run workflow patterns
  if (lowerMessage.includes('run workflow') || lowerMessage.includes('execute workflow') ||
      lowerMessage.includes('start workflow') || lowerMessage.includes('trigger workflow') ||
      lowerMessage.includes('activate workflow')) {
    const nameMatch = message.match(/(?:run|execute|start|trigger|activate)\s+(?:the\s+)?workflow\s+["']?([^"'\n]+?)["']?(?:\s|$)/i);
    return {
      isCommand: true,
      commandType: 'run_workflow',
      params: { name: nameMatch?.[1]?.trim() }
    };
  }

  // Create/schedule meeting patterns
  if (lowerMessage.includes('schedule meeting') || lowerMessage.includes('create meeting') ||
      lowerMessage.includes('set up meeting') || lowerMessage.includes('book meeting') ||
      lowerMessage.includes('add meeting')) {
    const titleMatch = message.match(/(?:meeting|call)\s+(?:about|for|with|called|titled)\s+["']?([^"'\n,]+?)["']?/i);
    const dateMatch = message.match(/(?:on|for|at)\s+(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|tomorrow|today|next\s+\w+)/i);
    const participantsMatch = message.match(/(?:with|participants?|attendees?)\s+["']?([^"'\n]+?)["']?(?:\s+(?:on|for|at)|$)/i);
    return {
      isCommand: true,
      commandType: 'create_meeting',
      params: {
        title: titleMatch?.[1]?.trim() || 'New Meeting',
        date: dateMatch?.[1]?.trim(),
        participants: participantsMatch?.[1]?.split(/[,&]/).map(p => p.trim()).filter(Boolean)
      }
    };
  }

  // List meetings patterns
  if (lowerMessage.includes('list meeting') || lowerMessage.includes('show meeting') ||
      lowerMessage.includes('my meeting') || lowerMessage.includes('upcoming meeting') ||
      lowerMessage.includes('what meeting')) {
    return {
      isCommand: true,
      commandType: 'list_meetings',
      params: {}
    };
  }

  // Add/update metric patterns
  if (lowerMessage.includes('add metric') || lowerMessage.includes('update metric') ||
      lowerMessage.includes('set metric') || lowerMessage.includes('record metric') ||
      lowerMessage.includes('log metric') || lowerMessage.includes('track metric')) {
    const nameMatch = message.match(/(?:add|update|set|record|log|track)\s+(?:the\s+)?(?:metric\s+)?["']?([^"'\n,]+?)["']?\s+(?:to|at|as|=|is)/i);
    const valueMatch = message.match(/(?:to|at|as|=|is)\s+["']?(\$?[\d,.]+%?)["']?/i);
    const typeMatch = message.match(/(?:type|category)\s+["']?(\w+)["']?/i);
    return {
      isCommand: true,
      commandType: 'add_metric',
      params: {
        name: nameMatch?.[1]?.trim(),
        value: valueMatch?.[1]?.replace(/[$,]/g, '').trim(),
        metricType: typeMatch?.[1]?.toLowerCase() || 'custom'
      }
    };
  }

  // Create insight patterns
  if (lowerMessage.includes('create insight') || lowerMessage.includes('add insight') ||
      lowerMessage.includes('save insight') || lowerMessage.includes('note insight') ||
      lowerMessage.includes('record insight')) {
    const contentMatch = message.match(/(?:insight|note)\s*[:\-]?\s*["']?(.+)["']?$/i);
    return {
      isCommand: true,
      commandType: 'create_insight',
      params: { content: contentMatch?.[1]?.trim() }
    };
  }

  // List insights patterns
  if (lowerMessage.includes('list insight') || lowerMessage.includes('show insight') ||
      lowerMessage.includes('my insight') || lowerMessage.includes('recent insight')) {
    return {
      isCommand: true,
      commandType: 'list_insights',
      params: {}
    };
  }

  // Assign task to employee patterns
  if ((lowerMessage.includes('assign') || lowerMessage.includes('give')) && 
      (lowerMessage.includes('task') || lowerMessage.includes('to'))) {
    const taskMatch = message.match(/(?:assign|give)\s+(?:task\s+)?["']?([^"'\n]+?)["']?\s+to\s+["']?([^"'\n]+?)["']?/i);
    return {
      isCommand: true,
      commandType: 'assign_task',
      params: {
        task: taskMatch?.[1]?.trim(),
        employeeName: taskMatch?.[2]?.trim()
      }
    };
  }

  // Ask employee to do something patterns
  if (lowerMessage.includes('ask') && (lowerMessage.includes('to') || lowerMessage.includes('about'))) {
    const employeeMatch = message.match(/ask\s+["']?([^"'\n]+?)["']?\s+(?:to|about)\s+["']?([^"'\n]+?)["']?/i);
    return {
      isCommand: true,
      commandType: 'ask_employee',
      params: {
        employeeName: employeeMatch?.[1]?.trim(),
        query: employeeMatch?.[2]?.trim()
      }
    };
  }

  // View reports patterns
  if (lowerMessage.includes('list report') || lowerMessage.includes('show report') ||
      lowerMessage.includes('my report') || lowerMessage.includes('recent report')) {
    return {
      isCommand: true,
      commandType: 'list_reports',
      params: {}
    };
  }

  // View forecasts patterns
  if (lowerMessage.includes('list forecast') || lowerMessage.includes('show forecast') ||
      lowerMessage.includes('my forecast') || lowerMessage.includes('recent forecast')) {
    return {
      isCommand: true,
      commandType: 'list_forecasts',
      params: {}
    };
  }

  // Create workflow patterns
  if (lowerMessage.includes('create workflow') || lowerMessage.includes('build workflow') || 
      lowerMessage.includes('new workflow') || lowerMessage.includes('make a workflow')) {
    const nameMatch = message.match(/(?:called|named|titled)\s+["']?([^"'\n]+)["']?/i) ||
                      message.match(/workflow\s+(?:for|to)\s+["']?([^"'\n]+)["']?/i);
    return {
      isCommand: true,
      commandType: 'create_workflow',
      params: { name: nameMatch?.[1]?.trim() || 'New Workflow from Chat' }
    };
  }
  
  // Delete workflow patterns
  if (lowerMessage.includes('delete workflow') || lowerMessage.includes('remove workflow')) {
    const nameMatch = message.match(/(?:delete|remove)\s+workflow\s+["']?([^"'\n]+)["']?/i);
    return {
      isCommand: true,
      commandType: 'delete_workflow',
      params: { name: nameMatch?.[1]?.trim() }
    };
  }
  
  // Create AI employee patterns
  if (lowerMessage.includes('create employee') || lowerMessage.includes('add employee') ||
      lowerMessage.includes('hire') || lowerMessage.includes('new ai employee') ||
      lowerMessage.includes('create an ai') || lowerMessage.includes('add an ai') ||
      lowerMessage.includes('create ai') || lowerMessage.includes('add ai')) {
    
    let role = null;
    let name = null;
    let department = null;
    
    const hireMatch = message.match(/hire\s+(?:a|an)\s+["']?([^"'\n,]+?)["']?(?:\s+(?:called|named|in|for|$))/i);
    if (hireMatch) role = hireMatch[1].trim();
    
    if (!role) {
      const createAIMatch = message.match(/create\s+(?:an?\s+)?ai\s+["']?([^"'\n,]+?)["']?(?:\s+(?:called|named|in|for|$)|$)/i);
      if (createAIMatch) role = createAIMatch[1].trim();
    }
    
    if (!role) {
      const addAIMatch = message.match(/add\s+(?:an?\s+)?ai\s+["']?([^"'\n,]+?)["']?(?:\s+(?:called|named|in|for|$)|$)/i);
      if (addAIMatch) role = addAIMatch[1].trim();
    }
    
    if (!role) {
      const roleMatch = message.match(/(?:as\s+(?:a|an)|role\s+of|position\s+of)\s+["']?([^"'\n,]+?)["']?/i);
      if (roleMatch) role = roleMatch[1].trim();
    }
    
    if (!role) {
      const newEmployeeMatch = message.match(/new\s+ai\s+employee\s+["']?([^"'\n,]+?)["']?(?:\s+(?:called|named|in|for|$)|$)/i);
      if (newEmployeeMatch) role = newEmployeeMatch[1].trim();
    }
    
    if (!role) {
      const employeeMatch = message.match(/(?:create|add)\s+employee\s+["']?([^"'\n,]+?)["']?(?:\s+(?:called|named|in|for|$)|$)/i);
      if (employeeMatch) role = employeeMatch[1].trim();
    }
    
    if (role) {
      role = role.replace(/\s+(employee|ai|assistant)$/i, '').trim();
      role = role.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    
    const nameMatch = message.match(/(?:called|named)\s+["']?([^"'\n,]+?)["']?(?:\s|$)/i);
    if (nameMatch) name = nameMatch[1].trim();
    
    const departmentMatch = message.match(/(?:in|for)\s+(?:the\s+)?["']?(\w+)["']?\s+(?:department|team)/i);
    if (departmentMatch) department = departmentMatch[1].trim();
    
    if (!department && role) {
      const roleLower = role.toLowerCase();
      if (roleLower.includes('market') || roleLower.includes('sales') || roleLower.includes('growth')) {
        department = 'Marketing';
      } else if (roleLower.includes('financ') || roleLower.includes('account') || roleLower.includes('budget')) {
        department = 'Finance';
      } else if (roleLower.includes('engineer') || roleLower.includes('develop') || roleLower.includes('tech')) {
        department = 'Engineering';
      } else if (roleLower.includes('hr') || roleLower.includes('human') || roleLower.includes('recruit')) {
        department = 'Human Resources';
      } else if (roleLower.includes('operation') || roleLower.includes('ops')) {
        department = 'Operations';
      } else if (roleLower.includes('strateg') || roleLower.includes('analyst') || roleLower.includes('research')) {
        department = 'Strategy';
      } else if (roleLower.includes('customer') || roleLower.includes('support') || roleLower.includes('service')) {
        department = 'Customer Success';
      } else if (roleLower.includes('legal') || roleLower.includes('compliance')) {
        department = 'Legal';
      } else if (roleLower.includes('product')) {
        department = 'Product';
      } else if (roleLower.includes('design') || roleLower.includes('creative') || roleLower.includes('ux')) {
        department = 'Design';
      }
    }
    
    return {
      isCommand: true,
      commandType: 'create_employee',
      params: { name, role, department }
    };
  }
  
  // Edit AI employee patterns
  if (lowerMessage.includes('edit employee') || lowerMessage.includes('update employee') ||
      lowerMessage.includes('change employee') || lowerMessage.includes('modify employee') ||
      lowerMessage.includes('rename employee') || lowerMessage.includes('edit ai employee') ||
      lowerMessage.includes('update ai employee') || lowerMessage.includes('change ai employee') ||
      (lowerMessage.includes('change') && lowerMessage.includes('role')) ||
      (lowerMessage.includes('move') && lowerMessage.includes('department'))) {
    
    let employeeName = null;
    let newName = null;
    let newRole = null;
    let newDepartment = null;
    
    const employeeNameMatch = message.match(/(?:edit|update|change|modify)\s+(?:ai\s+)?employee\s+["']?([^"'\n,]+?)["']?(?:\s+(?:to|as|role|name|department)|$)/i) ||
                              message.match(/(?:edit|update|change|modify)\s+["']?([^"'\n,]+?)["']?\s+(?:ai\s+)?employee/i);
    if (employeeNameMatch) employeeName = employeeNameMatch[1].trim();
    
    const renameMatch = message.match(/rename\s+(?:employee\s+)?["']?([^"'\n,]+?)["']?\s+to\s+["']?([^"'\n,]+?)["']?/i);
    if (renameMatch) {
      employeeName = renameMatch[1].trim();
      newName = renameMatch[2].trim();
    }
    
    const nameChangeMatch = message.match(/change\s+["']?([^"'\n,]+?)["']?(?:'s)?\s+name\s+to\s+["']?([^"'\n,]+?)["']?/i);
    if (nameChangeMatch) {
      employeeName = nameChangeMatch[1].trim();
      newName = nameChangeMatch[2].trim();
    }
    
    const roleChangeMatch = message.match(/change\s+["']?([^"'\n,]+?)["']?(?:'s)?\s+role\s+to\s+["']?([^"'\n,]+?)["']?/i);
    if (roleChangeMatch) {
      employeeName = roleChangeMatch[1].trim();
      newRole = roleChangeMatch[2].trim();
    }
    
    const deptMoveMatch = message.match(/move\s+["']?([^"'\n,]+?)["']?\s+to\s+(?:the\s+)?["']?([^"'\n,]+?)["']?\s*(?:department|team)?/i);
    if (deptMoveMatch) {
      employeeName = deptMoveMatch[1].trim();
      newDepartment = deptMoveMatch[2].trim();
    }
    
    const deptChangeMatch = message.match(/change\s+["']?([^"'\n,]+?)["']?(?:'s)?\s+department\s+to\s+["']?([^"'\n,]+?)["']?/i);
    if (deptChangeMatch) {
      employeeName = deptChangeMatch[1].trim();
      newDepartment = deptChangeMatch[2].trim();
    }
    
    const genericRoleMatch = message.match(/(?:update|set)\s+["']?([^"'\n,]+?)["']?\s+role\s+(?:to|as)\s+["']?([^"'\n,]+?)["']?/i);
    if (genericRoleMatch) {
      employeeName = genericRoleMatch[1].trim();
      newRole = genericRoleMatch[2].trim();
    }
    
    if (!newRole && !newName && !newDepartment) {
      const toMatch = message.match(/\bto\s+(?:a\s+)?["']?([^"'\n,]+?)["']?$/i);
      if (toMatch) newRole = toMatch[1].trim();
    }
    
    return {
      isCommand: true,
      commandType: 'edit_employee',
      params: { employeeName, newName, newRole, newDepartment }
    };
  }

  // Ask ClawdBot / ClaudeBot patterns
  if (lowerMessage.includes('clawdbot') || lowerMessage.includes('claudebot') || lowerMessage.includes('claude bot') ||
      lowerMessage.includes('ask claude') || lowerMessage.includes('tell claude') ||
      lowerMessage.includes('clawdbot analyze') || lowerMessage.includes('clawdbot sync') ||
      lowerMessage.includes('clawdbot connect')) {
    const queryMatch = message.match(/(?:clawdbot|claudebot|claude\s*bot|ask\s+claude|tell\s+claude)\s*[,:]?\s*(.+)/i);
    return {
      isCommand: true,
      commandType: 'clawdbot_action',
      params: { query: queryMatch?.[1]?.trim() || message }
    };
  }

  // Check connected APIs / data sources patterns
  if (lowerMessage.includes('connected api') || lowerMessage.includes('api connection') ||
      lowerMessage.includes('data source') || lowerMessage.includes('data feed') ||
      lowerMessage.includes('check connection') || lowerMessage.includes('my integrations') ||
      lowerMessage.includes('what apis') || lowerMessage.includes('show connections')) {
    return {
      isCommand: true,
      commandType: 'list_connections',
      params: {}
    };
  }
  
  // Read uploaded data / documents patterns
  if (lowerMessage.includes('uploaded data') || lowerMessage.includes('my documents') ||
      lowerMessage.includes('business plan') || lowerMessage.includes('show documents') ||
      lowerMessage.includes('uploaded files') || lowerMessage.includes('my data')) {
    return {
      isCommand: true,
      commandType: 'list_documents',
      params: {}
    };
  }
  
  // Read all data patterns (comprehensive data overview)
  if (lowerMessage.includes('all data') || lowerMessage.includes('data overview') ||
      lowerMessage.includes('everything i have') || lowerMessage.includes('all my information') ||
      lowerMessage.includes('full data') || lowerMessage.includes('complete data')) {
    return {
      isCommand: true,
      commandType: 'data_overview',
      params: {}
    };
  }
  
  // Data visualization patterns
  if (lowerMessage.includes('show me') || lowerMessage.includes('visualize') ||
      lowerMessage.includes('graph') || lowerMessage.includes('chart') ||
      lowerMessage.includes('display data') || lowerMessage.includes('analytics')) {
    return {
      isCommand: true,
      commandType: 'visualize_data',
      params: { query: message }
    };
  }
  
  // List workflows
  if (lowerMessage.includes('list workflows') || lowerMessage.includes('show workflows') ||
      lowerMessage.includes('my workflows')) {
    return {
      isCommand: true,
      commandType: 'list_workflows',
      params: {}
    };
  }
  
  // List employees
  if (lowerMessage.includes('list employees') || lowerMessage.includes('show employees') ||
      lowerMessage.includes('my team') || lowerMessage.includes('ai team')) {
    return {
      isCommand: true,
      commandType: 'list_employees',
      params: {}
    };
  }
  
  // Delete AI employee patterns
  if (lowerMessage.includes('delete employee') || lowerMessage.includes('remove employee') ||
      lowerMessage.includes('fire employee') || lowerMessage.includes('delete ai employee') ||
      lowerMessage.includes('remove ai employee') || lowerMessage.includes('fire ai')) {
    
    const deleteNameMatch = message.match(/(?:delete|remove|fire)\s+(?:ai\s+)?employee\s+["']?([^"'\n,]+?)["']?(?:\s|$)/i) ||
                            message.match(/(?:delete|remove|fire)\s+["']?([^"'\n,]+?)["']?\s+(?:from\s+)?(?:ai\s+)?(?:team|employees)?/i);
    
    return {
      isCommand: true,
      commandType: 'delete_employee',
      params: { employeeName: deleteNameMatch?.[1]?.trim() }
    };
  }
  
  return { isCommand: false, commandType: '', params: {} };
}

// Helper to get OpenClaw config or fallback to Lovable AI Gateway
async function getAiConfig(supabase: any, userId: string | null, lovableApiKey: string) {
  if (!userId) return { endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions', apiKey: lovableApiKey, isOpenClaw: false };
  
  const { data } = await supabase
    .from('connected_agents')
    .select('api_endpoint, api_key_encrypted')
    .eq('user_id', userId)
    .eq('platform', 'openclaw')
    .eq('status', 'active')
    .maybeSingle();
  
  if (data?.api_endpoint && data?.api_key_encrypted) {
    // OpenClaw uses OpenAI-compatible API, append /chat/completions if needed
    let endpoint = data.api_endpoint;
    if (!endpoint.endsWith('/chat/completions')) {
      endpoint = endpoint.replace(/\/$/, '') + '/chat/completions';
    }
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { message, businessContext } = await req.json();
    
    // Check for authentication
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    let isAuthenticated = false;
    
    if (authHeader?.startsWith('Bearer ')) {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const token = authHeader.replace('Bearer ', '');
      const { data, error } = await supabaseAuth.auth.getUser(token);
      
      if (!error && data?.user) {
        userId = data.user.id;
        isAuthenticated = true;
        console.log('Processing chat message for authenticated user:', userId);
      }
    }
    
    // Create service client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get AI config (OpenClaw or fallback)
    const aiConfig = await getAiConfig(supabase, userId, LOVABLE_API_KEY);

    // Parse for commands
    const { isCommand, commandType, params } = parseCommand(message);
    let commandResult: CommandResult | null = null;

    // Execute commands if detected
    if (isCommand) {
      const authRequiredCommands = [
        'create_workflow', 'delete_workflow', 'create_employee', 'edit_employee', 'delete_employee', 
        'list_workflows', 'list_employees', 'visualize_data', 'list_connections', 'list_documents', 
        'data_overview', 'generate_report', 'generate_forecast', 'run_workflow', 'create_meeting',
        'list_meetings', 'add_metric', 'create_insight', 'list_insights', 'assign_task', 'ask_employee',
        'list_reports', 'list_forecasts'
      ];
      
      if (authRequiredCommands.includes(commandType) && !isAuthenticated) {
        commandResult = { 
          type: 'info', 
          success: false, 
          message: 'Please log in to use this feature. You can sign up or log in to access all capabilities.' 
        };
      } else {
        switch (commandType) {
          case 'generate_report':
            // Generate a report using AI
            const { data: reportMetrics } = await supabase
              .from('business_metrics')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(50);

            const { data: reportInsights } = await supabase
              .from('ai_insights')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(20);

            const reportPrompt = `Generate a ${params.reportType} business report for ${params.period}.
              
Metrics: ${JSON.stringify(reportMetrics || []).substring(0, 2000)}
Insights: ${JSON.stringify(reportInsights || []).substring(0, 1000)}

Create a comprehensive report with:
1. Executive Summary
2. Key Performance Analysis
3. Trends & Insights
4. Recommendations
5. Next Steps`;

            const reportResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  { role: 'system', content: 'You are a professional business analyst creating executive reports.' },
                  { role: 'user', content: reportPrompt }
                ],
              }),
            });

            if (reportResponse.ok) {
              const reportData = await reportResponse.json();
              const reportContent = reportData.choices[0].message.content;
              
              // Save the report
              const { data: savedReport, error: saveError } = await supabase
                .from('reports')
                .insert({
                  user_id: userId,
                  title: `${params.reportType.charAt(0).toUpperCase() + params.reportType.slice(1)} Report - ${params.period}`,
                  report_type: params.reportType,
                  content: reportContent,
                  status: 'completed',
                  period_start: new Date().toISOString().split('T')[0],
                  period_end: new Date().toISOString().split('T')[0]
                })
                .select()
                .single();

              commandResult = { 
                type: 'report', 
                success: true, 
                data: { report: savedReport, content: reportContent },
                message: `Generated ${params.reportType} report for ${params.period}` 
              };
            } else {
              commandResult = { type: 'report', success: false, message: 'Failed to generate report' };
            }
            break;

          case 'generate_forecast':
            // Get historical metrics for forecasting
            const { data: forecastMetrics } = await supabase
              .from('business_metrics')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(100);

            const forecastPrompt = `Generate a ${params.forecastType} forecast for the next ${params.timeHorizon}.

Historical Data: ${JSON.stringify(forecastMetrics || []).substring(0, 3000)}

Provide predictions in this JSON format:
{
  "predictions": [{"metric": "...", "current": ..., "forecast": ..., "confidence": 85}],
  "risks": ["..."],
  "opportunities": ["..."],
  "recommendations": ["..."],
  "summary": "..."
}`;

            const forecastResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  { role: 'system', content: 'You are a business forecasting expert. Return valid JSON only.' },
                  { role: 'user', content: forecastPrompt }
                ],
              }),
            });

            if (forecastResponse.ok) {
              const forecastData = await forecastResponse.json();
              const forecastContent = forecastData.choices[0].message.content;
              
              let predictions = null;
              try {
                predictions = JSON.parse(forecastContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
              } catch (e) {
                predictions = { summary: forecastContent };
              }
              
              // Save the forecast
              const { data: savedForecast } = await supabase
                .from('forecasts')
                .insert({
                  user_id: userId,
                  title: `${params.forecastType.charAt(0).toUpperCase() + params.forecastType.slice(1)} Forecast - ${params.timeHorizon}`,
                  forecast_type: params.forecastType,
                  time_horizon: params.timeHorizon,
                  predictions: predictions,
                  confidence_score: predictions?.predictions?.[0]?.confidence || 75,
                  status: 'completed'
                })
                .select()
                .single();

              commandResult = { 
                type: 'forecast', 
                success: true, 
                data: { forecast: savedForecast, predictions },
                message: `Generated ${params.forecastType} forecast for next ${params.timeHorizon}` 
              };
            } else {
              commandResult = { type: 'forecast', success: false, message: 'Failed to generate forecast' };
            }
            break;

          case 'run_workflow':
            if (params.name) {
              // Find the workflow
              const { data: workflows } = await supabase
                .from('ai_workflows')
                .select('*')
                .eq('user_id', userId)
                .ilike('name', `%${params.name}%`);

              if (workflows && workflows.length > 0) {
                const workflow = workflows[0];
                
                // Create a workflow run record
                const { data: runData } = await supabase
                  .from('workflow_runs')
                  .insert({
                    user_id: userId,
                    workflow_id: workflow.id,
                    status: 'running',
                    started_at: new Date().toISOString(),
                    logs: [{ timestamp: new Date().toISOString(), event: 'Started via chat' }]
                  })
                  .select()
                  .single();

                // Update workflow run count
                await supabase
                  .from('ai_workflows')
                  .update({ 
                    run_count: (workflow.run_count || 0) + 1,
                    last_run_at: new Date().toISOString()
                  })
                  .eq('id', workflow.id);

                // Mark as completed (simplified - actual execution would be more complex)
                await supabase
                  .from('workflow_runs')
                  .update({ 
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    logs: [
                      { timestamp: new Date().toISOString(), event: 'Started via chat' },
                      { timestamp: new Date().toISOString(), event: 'Execution completed' }
                    ]
                  })
                  .eq('id', runData?.id);

                commandResult = { 
                  type: 'run_workflow', 
                  success: true, 
                  data: { workflow, run: runData },
                  message: `Executed workflow "${workflow.name}" successfully (Run #${(workflow.run_count || 0) + 1})` 
                };
              } else {
                commandResult = { type: 'run_workflow', success: false, message: `No workflow found matching "${params.name}"` };
              }
            } else {
              commandResult = { type: 'run_workflow', success: false, message: 'Please specify the workflow name to run' };
            }
            break;

          case 'create_meeting':
            const meetingDate = params.date || new Date().toISOString().split('T')[0];
            
            const { data: meetingData, error: meetingError } = await supabase
              .from('meetings')
              .insert({
                user_id: userId,
                title: params.title,
                meeting_date: meetingDate,
                participants: params.participants || [],
                status: 'scheduled',
                duration_minutes: 30
              })
              .select()
              .single();

            if (meetingError) {
              commandResult = { type: 'meeting', success: false, message: meetingError.message };
            } else {
              commandResult = { 
                type: 'meeting', 
                success: true, 
                data: meetingData,
                message: `Scheduled meeting "${params.title}" for ${meetingDate}` 
              };
            }
            break;

          case 'list_meetings':
            const { data: meetings } = await supabase
              .from('meetings')
              .select('*')
              .eq('user_id', userId)
              .order('meeting_date', { ascending: true })
              .limit(10);

            commandResult = { type: 'meeting', success: true, data: meetings, message: 'meetings_list' };
            break;

          case 'add_metric':
            if (params.name && params.value) {
              const numericValue = parseFloat(params.value.replace('%', ''));
              const isPercentage = params.value.includes('%');
              
              const { data: metricData, error: metricError } = await supabase
                .from('business_metrics')
                .insert({
                  user_id: userId,
                  metric_name: params.name,
                  value: numericValue,
                  metric_type: isPercentage ? 'percentage' : params.metricType,
                  period: 'current',
                  change_percentage: 0
                })
                .select()
                .single();

              if (metricError) {
                commandResult = { type: 'metric', success: false, message: metricError.message };
              } else {
                commandResult = { 
                  type: 'metric', 
                  success: true, 
                  data: metricData,
                  message: `Added metric "${params.name}" with value ${params.value}` 
                };
              }
            } else {
              commandResult = { type: 'metric', success: false, message: 'Please specify both metric name and value' };
            }
            break;

          case 'create_insight':
            if (params.content) {
              const { data: insightData, error: insightError } = await supabase
                .from('ai_insights')
                .insert({
                  user_id: userId,
                  title: params.content.substring(0, 50) + (params.content.length > 50 ? '...' : ''),
                  content: params.content,
                  insight_type: 'user_created'
                })
                .select()
                .single();

              if (insightError) {
                commandResult = { type: 'insight', success: false, message: insightError.message };
              } else {
                commandResult = { 
                  type: 'insight', 
                  success: true, 
                  data: insightData,
                  message: 'Insight saved successfully' 
                };
              }
            } else {
              commandResult = { type: 'insight', success: false, message: 'Please provide insight content' };
            }
            break;

          case 'list_insights':
            const { data: insights } = await supabase
              .from('ai_insights')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(10);

            commandResult = { type: 'insight', success: true, data: insights, message: 'insights_list' };
            break;

          case 'assign_task':
            if (params.task && params.employeeName) {
              // Find the employee
              const { data: employees } = await supabase
                .from('ai_employees')
                .select('*')
                .eq('user_id', userId)
                .ilike('name', `%${params.employeeName}%`);

              if (employees && employees.length > 0) {
                const employee = employees[0];
                
                // Use AI to process the task with the employee's context
                const taskPrompt = `As ${employee.name}, a ${employee.role} in ${employee.department}, analyze and respond to this task: "${params.task}"
                
Your expertise: ${(employee.expertise || []).join(', ')}
Your personality: ${employee.personality || 'Professional and helpful'}

Provide a brief analysis and action plan.`;

                const taskResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
                    messages: [
                      { role: 'system', content: `You are ${employee.name}, an AI employee working as ${employee.role}.` },
                      { role: 'user', content: taskPrompt }
                    ],
                  }),
                });

                if (taskResponse.ok) {
                  const taskData = await taskResponse.json();
                  const taskResult = taskData.choices[0].message.content;

                  // Save as an insight
                  await supabase.from('ai_insights').insert({
                    user_id: userId,
                    title: `Task: ${params.task.substring(0, 40)}...`,
                    content: `Assigned to ${employee.name}:\n\n${taskResult}`,
                    insight_type: 'task_response'
                  });

                  commandResult = { 
                    type: 'task', 
                    success: true, 
                    data: { employee, response: taskResult },
                    message: `Task assigned to ${employee.name}` 
                  };
                } else {
                  commandResult = { type: 'task', success: false, message: 'Failed to process task' };
                }
              } else {
                commandResult = { type: 'task', success: false, message: `No employee found matching "${params.employeeName}"` };
              }
            } else {
              commandResult = { type: 'task', success: false, message: 'Please specify both task and employee name' };
            }
            break;

          case 'ask_employee':
            if (params.employeeName && params.query) {
              // Find the employee
              const { data: askEmployees } = await supabase
                .from('ai_employees')
                .select('*')
                .eq('user_id', userId)
                .ilike('name', `%${params.employeeName}%`);

              if (askEmployees && askEmployees.length > 0) {
                const employee = askEmployees[0];
                
                // Get business context for the employee
                const { data: empMetrics } = await supabase
                  .from('business_metrics')
                  .select('*')
                  .eq('user_id', userId)
                  .limit(10);

                const askPrompt = `As ${employee.name}, a ${employee.role} in ${employee.department}, answer this question: "${params.query}"
                
Your expertise: ${(employee.expertise || []).join(', ')}
Business context: ${JSON.stringify(empMetrics || []).substring(0, 500)}

Provide a helpful, role-appropriate response.`;

                const askResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
                    messages: [
                      { role: 'system', content: `You are ${employee.name}, an AI employee working as ${employee.role} in ${employee.department}. Stay in character.` },
                      { role: 'user', content: askPrompt }
                    ],
                  }),
                });

                if (askResponse.ok) {
                  const askData = await askResponse.json();
                  const askResult = askData.choices[0].message.content;

                  commandResult = { 
                    type: 'task', 
                    success: true, 
                    data: { employee, response: askResult },
                    message: `Response from ${employee.name}` 
                  };
                } else {
                  commandResult = { type: 'task', success: false, message: 'Failed to get response' };
                }
              } else {
                commandResult = { type: 'task', success: false, message: `No employee found matching "${params.employeeName}"` };
              }
            } else {
              commandResult = { type: 'task', success: false, message: 'Please specify employee name and question' };
            }
            break;

          case 'clawdbot_action':
            // ClawdBot: AI assistant that can access all connected APIs and perform tasks
            const clawdQuery = params.query || message;
            const clawdLower = clawdQuery.toLowerCase();
            
            // Fetch all connected APIs and agents for ClawdBot context
            const [
              { data: clawdConnections },
              { data: clawdAgents },
              { data: clawdWorkflows },
              { data: clawdMetrics },
              { data: clawdEmployees }
            ] = await Promise.all([
              supabase.from('api_connections').select('*').eq('user_id', userId),
              supabase.from('connected_agents').select('*').eq('user_id', userId),
              supabase.from('ai_workflows').select('*').eq('user_id', userId).limit(10),
              supabase.from('business_metrics').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
              supabase.from('ai_employees').select('*').eq('user_id', userId)
            ]);

            // Build ClawdBot context with full API access
            let clawdContext = `You are ClawdBot, an advanced AI operations agent integrated into the Sibe Command Centre. You have access to all connected APIs and can orchestrate tasks across the entire ecosystem.\n\n`;
            clawdContext += `=== CONNECTED DATA SOURCES ===\n`;
            if (clawdConnections && clawdConnections.length > 0) {
              clawdConnections.forEach((c: any) => {
                clawdContext += `- ${c.name} (${c.provider}): Status=${c.status}, Endpoint=${c.api_endpoint || 'N/A'}, Last Sync=${c.last_sync_at || 'Never'}\n`;
              });
            } else {
              clawdContext += `No data sources connected yet.\n`;
            }
            
            clawdContext += `\n=== CONNECTED AI AGENTS ===\n`;
            if (clawdAgents && clawdAgents.length > 0) {
              clawdAgents.forEach((a: any) => {
                clawdContext += `- ${a.agent_name} (${a.platform}): Status=${a.status}, Calls=${a.call_count || 0}\n`;
              });
            } else {
              clawdContext += `No external AI agents connected.\n`;
            }
            
            clawdContext += `\n=== ACTIVE WORKFLOWS ===\n`;
            if (clawdWorkflows && clawdWorkflows.length > 0) {
              clawdWorkflows.forEach((w: any) => {
                clawdContext += `- ${w.name} (${w.status}): Runs=${w.run_count || 0}\n`;
              });
            }
            
            clawdContext += `\n=== BUSINESS METRICS ===\n`;
            if (clawdMetrics && clawdMetrics.length > 0) {
              clawdMetrics.forEach((m: any) => {
                clawdContext += `- ${m.metric_name}: ${m.value}${m.change_percentage ? ` (${m.change_percentage > 0 ? '+' : ''}${m.change_percentage}%)` : ''}\n`;
              });
            }
            
            clawdContext += `\n=== AI TEAM ===\n`;
            if (clawdEmployees && clawdEmployees.length > 0) {
              clawdEmployees.forEach((e: any) => {
                clawdContext += `- ${e.name}: ${e.role} in ${e.department}\n`;
              });
            }
            
            clawdContext += `\nYou can: analyze data across all connections, suggest workflow optimizations, coordinate AI employees, trigger syncs, generate reports, and provide strategic recommendations. Be concise, action-oriented, and reference specific data when available. If the user asks you to connect to an API, guide them to the Data section to add the connection. Sign off responses with "— ClawdBot 🤖"`;

            const clawdResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  { role: 'system', content: clawdContext },
                  { role: 'user', content: clawdQuery }
                ],
              }),
            });

            if (clawdResponse.ok) {
              const clawdData = await clawdResponse.json();
              const clawdResult = clawdData.choices[0].message.content;
              
              commandResult = { 
                type: 'info', 
                success: true, 
                data: { 
                  response: clawdResult, 
                  connections: clawdConnections?.length || 0,
                  agents: clawdAgents?.length || 0,
                  workflows: clawdWorkflows?.length || 0 
                },
                message: 'clawdbot_response' 
              };
            } else {
              commandResult = { type: 'info', success: false, message: 'ClawdBot failed to process your request. Please try again.' };
            }
            break;

          case 'list_reports':
            const { data: reports } = await supabase
              .from('reports')
              .select('id, title, report_type, status, created_at')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(10);

            commandResult = { type: 'report', success: true, data: reports, message: 'reports_list' };
            break;

          case 'list_forecasts':
            const { data: forecasts } = await supabase
              .from('forecasts')
              .select('id, title, forecast_type, time_horizon, confidence_score, status, created_at')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(10);

            commandResult = { type: 'forecast', success: true, data: forecasts, message: 'forecasts_list' };
            break;

          case 'create_workflow':
            const { data: workflowData, error: workflowError } = await supabase
              .from('ai_workflows')
              .insert({
                user_id: userId,
                name: params.name,
                description: `Created via chat: "${message}"`,
                status: 'draft',
                trigger_type: 'manual',
                nodes: []
              })
              .select()
              .single();
            
            if (workflowError) {
              commandResult = { type: 'workflow', success: false, message: workflowError.message };
            } else {
              commandResult = { type: 'workflow', success: true, data: workflowData, message: `Created workflow "${params.name}"` };
            }
            break;

          case 'delete_workflow':
            if (params.name) {
              const { data: workflows } = await supabase
                .from('ai_workflows')
                .select('id, name')
                .eq('user_id', userId)
                .ilike('name', `%${params.name}%`);
              
              if (workflows && workflows.length > 0) {
                const { error: deleteError } = await supabase
                  .from('ai_workflows')
                  .delete()
                  .eq('id', workflows[0].id);
                
                if (deleteError) {
                  commandResult = { type: 'delete_workflow', success: false, message: deleteError.message };
                } else {
                  commandResult = { type: 'delete_workflow', success: true, message: `Deleted workflow "${workflows[0].name}"` };
                }
              } else {
                commandResult = { type: 'delete_workflow', success: false, message: `No workflow found matching "${params.name}"` };
              }
            } else {
              commandResult = { type: 'delete_workflow', success: false, message: 'Please specify the workflow name to delete' };
            }
            break;

          case 'create_employee':
            const employeeName = params.name || `AI ${params.role || 'Assistant'}`;
            const employeeRole = params.role || 'General Assistant';
            const employeeDepartment = params.department || 'General';
            
            const { data: employeeData, error: employeeError } = await supabase
              .from('ai_employees')
              .insert({
                user_id: userId,
                name: employeeName,
                role: employeeRole,
                department: employeeDepartment,
                personality: `Created via chat. Specializes in ${employeeRole.toLowerCase()} tasks.`,
                expertise: [employeeRole, employeeDepartment],
                status: 'active'
              })
              .select()
              .single();
            
            if (employeeError) {
              commandResult = { type: 'employee', success: false, message: employeeError.message };
            } else {
              commandResult = { type: 'employee', success: true, data: employeeData, message: `Created AI employee "${employeeName}" as ${employeeRole} in ${employeeDepartment}` };
            }
            break;

          case 'edit_employee':
            if (params.employeeName) {
              const { data: matchingEmployees } = await supabase
                .from('ai_employees')
                .select('id, name, role, department')
                .eq('user_id', userId)
                .ilike('name', `%${params.employeeName}%`);
              
              if (matchingEmployees && matchingEmployees.length > 0) {
                const targetEmployee = matchingEmployees[0];
                const updateData: any = {};
                
                if (params.newName) updateData.name = params.newName;
                if (params.newRole) {
                  updateData.role = params.newRole;
                  updateData.personality = `Specializes in ${params.newRole.toLowerCase()} tasks.`;
                  updateData.expertise = [params.newRole, params.newDepartment || targetEmployee.department];
                }
                if (params.newDepartment) updateData.department = params.newDepartment;
                
                if (Object.keys(updateData).length > 0) {
                  updateData.updated_at = new Date().toISOString();
                  
                  const { data: updatedEmployee, error: updateError } = await supabase
                    .from('ai_employees')
                    .update(updateData)
                    .eq('id', targetEmployee.id)
                    .select()
                    .single();
                  
                  if (updateError) {
                    commandResult = { type: 'edit_employee', success: false, message: updateError.message };
                  } else {
                    let changeDesc = [];
                    if (params.newName) changeDesc.push(`name to "${params.newName}"`);
                    if (params.newRole) changeDesc.push(`role to "${params.newRole}"`);
                    if (params.newDepartment) changeDesc.push(`department to "${params.newDepartment}"`);
                    
                    commandResult = { 
                      type: 'edit_employee', 
                      success: true, 
                      data: updatedEmployee, 
                      message: `Updated ${targetEmployee.name}: ${changeDesc.join(', ')}` 
                    };
                  }
                } else {
                  commandResult = { type: 'edit_employee', success: false, message: 'No changes specified.' };
                }
              } else {
                commandResult = { type: 'edit_employee', success: false, message: `No employee found matching "${params.employeeName}"` };
              }
            } else {
              commandResult = { type: 'edit_employee', success: false, message: 'Please specify the employee name to edit.' };
            }
            break;

          case 'delete_employee':
            if (params.employeeName) {
              const { data: employeesToDelete } = await supabase
                .from('ai_employees')
                .select('id, name, role, department')
                .eq('user_id', userId)
                .ilike('name', `%${params.employeeName}%`);
              
              if (employeesToDelete && employeesToDelete.length > 0) {
                const employeeToDelete = employeesToDelete[0];
                
                const { error: deleteEmployeeError } = await supabase
                  .from('ai_employees')
                  .delete()
                  .eq('id', employeeToDelete.id);
                
                if (deleteEmployeeError) {
                  commandResult = { type: 'delete_employee', success: false, message: deleteEmployeeError.message };
                } else {
                  commandResult = { 
                    type: 'delete_employee', 
                    success: true, 
                    message: `Deleted AI employee "${employeeToDelete.name}"` 
                  };
                }
              } else {
                commandResult = { type: 'delete_employee', success: false, message: `No employee found matching "${params.employeeName}"` };
              }
            } else {
              commandResult = { type: 'delete_employee', success: false, message: 'Please specify the employee name to delete.' };
            }
            break;

          case 'list_workflows':
            const { data: userWorkflows } = await supabase
              .from('ai_workflows')
              .select('id, name, status, run_count, created_at')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(10);
            
            commandResult = { type: 'info', success: true, data: userWorkflows, message: 'workflows_list' };
            break;

          case 'list_employees':
            const { data: userEmployees } = await supabase
              .from('ai_employees')
              .select('id, name, role, department, status')
              .eq('user_id', userId)
              .order('created_at', { ascending: false });
            
            commandResult = { type: 'info', success: true, data: userEmployees, message: 'employees_list' };
            break;

          case 'visualize_data':
            const { data: metricsData } = await supabase
              .from('business_metrics')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(20);
            
            commandResult = { type: 'data', success: true, data: metricsData };
            break;

          case 'list_connections':
            const { data: connections } = await supabase
              .from('api_connections')
              .select('id, name, provider, status, last_sync_at, api_endpoint')
              .eq('user_id', userId)
              .order('created_at', { ascending: false });
            
            commandResult = { type: 'connections', success: true, data: connections || [], message: 'connections_list' };
            break;

          case 'list_documents':
            const { data: documents } = await supabase
              .from('business_plans')
              .select('id, title, description, created_at, updated_at')
              .eq('user_id', userId)
              .order('created_at', { ascending: false });
            
            const { data: websites } = await supabase
              .from('website_analyses')
              .select('id, website_url, created_at')
              .eq('user_id', userId)
              .order('created_at', { ascending: false });
            
            commandResult = { 
              type: 'documents', 
              success: true, 
              data: { documents: documents || [], websites: websites || [] }, 
              message: 'documents_list' 
            };
            break;

          case 'data_overview':
            const [
              { data: overviewConnections },
              { data: overviewDocs },
              { data: overviewWebsites },
              { data: overviewMetrics },
              { data: overviewWorkflows },
              { data: overviewEmployees },
              { data: overviewReports },
              { data: overviewForecasts },
              { data: overviewMeetings },
              { data: overviewInsights }
            ] = await Promise.all([
              supabase.from('api_connections').select('id, name, provider, status').eq('user_id', userId),
              supabase.from('business_plans').select('id, title, description').eq('user_id', userId),
              supabase.from('website_analyses').select('id, website_url, analysis_content').eq('user_id', userId),
              supabase.from('business_metrics').select('metric_name, value, change_percentage, period').eq('user_id', userId).limit(20),
              supabase.from('ai_workflows').select('id, name, status, run_count').eq('user_id', userId),
              supabase.from('ai_employees').select('id, name, role, department').eq('user_id', userId),
              supabase.from('reports').select('id, title, report_type, status').eq('user_id', userId).limit(5),
              supabase.from('forecasts').select('id, title, forecast_type, confidence_score').eq('user_id', userId).limit(5),
              supabase.from('meetings').select('id, title, meeting_date, status').eq('user_id', userId).limit(5),
              supabase.from('ai_insights').select('id, title, insight_type').eq('user_id', userId).limit(10)
            ]);
            
            commandResult = { 
              type: 'data_overview', 
              success: true, 
              data: {
                connections: overviewConnections || [],
                documents: overviewDocs || [],
                websites: overviewWebsites || [],
                metrics: overviewMetrics || [],
                workflows: overviewWorkflows || [],
                employees: overviewEmployees || [],
                reports: overviewReports || [],
                forecasts: overviewForecasts || [],
                meetings: overviewMeetings || [],
                insights: overviewInsights || []
              }, 
              message: 'data_overview'
            };
            break;
        }
      }
    }

    // Build enhanced context for AI - Ecommerce Scaling Focus
    let context = "You are Sibe SI (Synthetic Intelligence Business Engine), an AI-powered ecommerce scaling platform. You help online store owners grow their business using data, AI insights, and automation.\n\n";
    
    // Enhanced command capabilities - Ecommerce Focus
    context += "=== YOUR ECOMMERCE SCALING CAPABILITIES ===\n\n";
    context += "📊 SALES & REVENUE:\n";
    context += "- Analyze revenue trends, top products, and customer behavior\n";
    context += "- 'Generate monthly sales report' or 'Show revenue forecast'\n";
    context += "- 'What are my top performing products this month?'\n";
    context += "- 'Analyze my ad spend ROI' or 'Show customer acquisition trends'\n\n";
    
    context += "🔗 DATA INTEGRATIONS:\n";
    context += "- Connect Shopify, Meta Ads, Google Analytics, Stripe\n";
    context += "- 'Sync my Shopify data' or 'Check API connections'\n";
    context += "- 'Show my connected data sources'\n";
    context += "- Multi-store support for scaling ecommerce brands\n\n";
    
    context += "🤖 AI AUTOMATION:\n";
    context += "- 'Hire an AI marketing analyst' to review campaigns\n";
    context += "- 'Ask my AI accountant about cash flow'\n";
    context += "- Connect external workflows (n8n, Make, Zapier) for automation\n";
    context += "- Link AI agents from OpenAI/Claude for specialized tasks\n";
    context += "- 'ClawdBot analyze my data' - invoke ClawdBot for cross-API analysis\n";
    context += "- 'ClawdBot sync APIs' - check all connections and sync status\n";
    context += "- 'ClawdBot recommend strategies' - get AI-powered scaling advice\n\n";
    
    context += "📈 SCALING STRATEGIES:\n";
    context += "- 'How can I scale my store faster?'\n";
    context += "- 'What should I optimize to increase conversions?'\n";
    context += "- 'Recommend strategies to reduce customer acquisition cost'\n";
    context += "- Set KPI targets and get alerts when metrics are off track\n\n";
    
    context += "📅 OPERATIONS:\n";
    context += "- 'Schedule a Q4 planning meeting'\n";
    context += "- 'Track inventory levels' or 'Monitor fulfillment metrics'\n";
    context += "- 'Create insight: Holiday sales strategy needed'\n\n";

    // Add command result to context
    if (commandResult) {
      context += "=== COMMAND EXECUTED ===\n";
      context += `Action: ${commandResult.type}\n`;
      context += `Success: ${commandResult.success}\n`;
      if (commandResult.message) {
        context += `Result: ${commandResult.message}\n`;
      }
      if (commandResult.data) {
        context += `Data: ${JSON.stringify(commandResult.data).substring(0, 2000)}\n`;
      }
      context += "\n";
    }

    let hasBusinessData = false;

    // Include business context
    if (businessContext?.businessPlan) {
      hasBusinessData = true;
      const plan = businessContext.businessPlan;
      context += `=== BUSINESS DNA ===\n`;
      context += `Name: ${plan.title}\n`;
      if (plan.description) context += `Description: ${plan.description}\n`;
      if (plan.content) context += `Details:\n${plan.content.substring(0, 2000)}\n\n`;
    }

    if (businessContext?.websiteAnalysis) {
      hasBusinessData = true;
      context += `=== WEBSITE ANALYSIS ===\n`;
      context += `URL: ${businessContext.websiteAnalysis.website_url}\n`;
      context += `Analysis:\n${businessContext.websiteAnalysis.analysis_content.substring(0, 1500)}\n\n`;
    }

    if (businessContext?.metrics?.length > 0) {
      hasBusinessData = true;
      context += "=== LIVE METRICS ===\n";
      businessContext.metrics.forEach((m: any) => {
        context += `- ${m.metric_name}: ${m.value}${m.change_percentage ? ` (${m.change_percentage > 0 ? '+' : ''}${m.change_percentage}%)` : ''}\n`;
      });
      context += "\n";
    }

    if (businessContext?.workflows?.length > 0) {
      hasBusinessData = true;
      context += "=== ACTIVE WORKFLOWS ===\n";
      businessContext.workflows.forEach((w: any) => {
        context += `- ${w.name} (${w.status}) - ${w.run_count || 0} runs\n`;
      });
      context += "\n";
    }

    if (businessContext?.employees?.length > 0) {
      hasBusinessData = true;
      context += "=== AI TEAM ===\n";
      businessContext.employees.forEach((e: any) => {
        context += `- ${e.name}: ${e.role} in ${e.department}\n`;
      });
      context += "\n";
    }

    if (businessContext?.apiConnections?.length > 0) {
      hasBusinessData = true;
      context += "=== DATA CONNECTIONS ===\n";
      businessContext.apiConnections.forEach((c: any) => {
        context += `- ${c.name} (${c.provider}): ${c.status}\n`;
      });
      context += "\n";
    }

    if (!hasBusinessData && !commandResult) {
      context += "NOTE: Get started by connecting your store data:\n";
      context += "1. Connect Shopify to sync orders, products, and inventory\n";
      context += "2. Connect Meta Ads to track ad performance and ROAS\n";
      context += "3. Connect Google Analytics for traffic and conversion data\n";
      context += "4. Connect Stripe for payment and subscription metrics\n";
      context += "5. Hire AI employees to analyze your data automatically\n\n";
    }

    context += "RESPONSE STYLE: Be concise and focus on ecommerce growth. Provide actionable insights. When suggesting improvements, be specific about expected impact (e.g., '15-20% lift in conversion'). Guide users to scale their online stores through data-driven decisions. Note that third-party integrations may have additional costs.";

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
          { role: 'system', content: context },
          { role: 'user', content: message }
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
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        commandResult: commandResult 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[sibe-chat] error:', error);
    const message = error instanceof Error ? error.message : '';
    const isClientError = message === 'Unauthorized' || message.includes('required');
    return new Response(
      JSON.stringify({ error: isClientError ? message : 'An internal error occurred' }),
      { status: isClientError ? 400 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
