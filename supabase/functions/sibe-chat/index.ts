import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommandResult {
  type: 'workflow' | 'employee' | 'data' | 'delete_workflow' | 'delete_employee' | 'info' | 'connections' | 'documents' | 'data_overview' | 'edit_employee';
  success: boolean;
  data?: any;
  message?: string;
}

// Parse user intent and extract commands
function parseCommand(message: string): { isCommand: boolean; commandType: string; params: any } {
  const lowerMessage = message.toLowerCase();
  
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
    
    // Multiple patterns to extract the role - ordered by specificity
    let role = null;
    let name = null;
    let department = null;
    
    // Pattern: "hire a [role]" or "hire an [role]"
    const hireMatch = message.match(/hire\s+(?:a|an)\s+["']?([^"'\n,]+?)["']?(?:\s+(?:called|named|in|for|$))/i);
    if (hireMatch) role = hireMatch[1].trim();
    
    // Pattern: "create an AI [role]" or "create AI [role]"
    if (!role) {
      const createAIMatch = message.match(/create\s+(?:an?\s+)?ai\s+["']?([^"'\n,]+?)["']?(?:\s+(?:called|named|in|for|$)|$)/i);
      if (createAIMatch) role = createAIMatch[1].trim();
    }
    
    // Pattern: "add an AI [role]" or "add AI [role]"
    if (!role) {
      const addAIMatch = message.match(/add\s+(?:an?\s+)?ai\s+["']?([^"'\n,]+?)["']?(?:\s+(?:called|named|in|for|$)|$)/i);
      if (addAIMatch) role = addAIMatch[1].trim();
    }
    
    // Pattern: "as a [role]" or "role of [role]"
    if (!role) {
      const roleMatch = message.match(/(?:as\s+(?:a|an)|role\s+of|position\s+of)\s+["']?([^"'\n,]+?)["']?/i);
      if (roleMatch) role = roleMatch[1].trim();
    }
    
    // Pattern: "new ai employee [role]"
    if (!role) {
      const newEmployeeMatch = message.match(/new\s+ai\s+employee\s+["']?([^"'\n,]+?)["']?(?:\s+(?:called|named|in|for|$)|$)/i);
      if (newEmployeeMatch) role = newEmployeeMatch[1].trim();
    }
    
    // Pattern: "create employee [role]" / "add employee [role]"
    if (!role) {
      const employeeMatch = message.match(/(?:create|add)\s+employee\s+["']?([^"'\n,]+?)["']?(?:\s+(?:called|named|in|for|$)|$)/i);
      if (employeeMatch) role = employeeMatch[1].trim();
    }
    
    // Clean up role - remove trailing words like "employee", "ai", etc.
    if (role) {
      role = role.replace(/\s+(employee|ai|assistant)$/i, '').trim();
      // Capitalize first letter of each word
      role = role.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    
    // Extract name if specified
    const nameMatch = message.match(/(?:called|named)\s+["']?([^"'\n,]+?)["']?(?:\s|$)/i);
    if (nameMatch) name = nameMatch[1].trim();
    
    // Extract department if specified
    const departmentMatch = message.match(/(?:in|for)\s+(?:the\s+)?["']?(\w+)["']?\s+(?:department|team)/i);
    if (departmentMatch) department = departmentMatch[1].trim();
    
    // Also try to infer department from role
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
      params: {
        name: name,
        role: role,
        department: department
      }
    };
  }
  
  // Edit AI employee patterns
  if (lowerMessage.includes('edit employee') || lowerMessage.includes('update employee') ||
      lowerMessage.includes('change employee') || lowerMessage.includes('modify employee') ||
      lowerMessage.includes('rename employee') || lowerMessage.includes('edit ai employee') ||
      lowerMessage.includes('update ai employee') || lowerMessage.includes('change ai employee') ||
      (lowerMessage.includes('change') && lowerMessage.includes('role')) ||
      (lowerMessage.includes('move') && lowerMessage.includes('department'))) {
    
    // Extract the employee name to edit
    let employeeName = null;
    let newName = null;
    let newRole = null;
    let newDepartment = null;
    
    // Pattern: "edit employee [name]" or "update [name] employee"
    const employeeNameMatch = message.match(/(?:edit|update|change|modify)\s+(?:ai\s+)?employee\s+["']?([^"'\n,]+?)["']?(?:\s+(?:to|as|role|name|department)|$)/i) ||
                              message.match(/(?:edit|update|change|modify)\s+["']?([^"'\n,]+?)["']?\s+(?:ai\s+)?employee/i);
    if (employeeNameMatch) employeeName = employeeNameMatch[1].trim();
    
    // Pattern: "rename [name] to [new name]"
    const renameMatch = message.match(/rename\s+(?:employee\s+)?["']?([^"'\n,]+?)["']?\s+to\s+["']?([^"'\n,]+?)["']?/i);
    if (renameMatch) {
      employeeName = renameMatch[1].trim();
      newName = renameMatch[2].trim();
    }
    
    // Pattern: "change [name]'s name to [new name]"
    const nameChangeMatch = message.match(/change\s+["']?([^"'\n,]+?)["']?(?:'s)?\s+name\s+to\s+["']?([^"'\n,]+?)["']?/i);
    if (nameChangeMatch) {
      employeeName = nameChangeMatch[1].trim();
      newName = nameChangeMatch[2].trim();
    }
    
    // Pattern: "change [name]'s role to [role]"
    const roleChangeMatch = message.match(/change\s+["']?([^"'\n,]+?)["']?(?:'s)?\s+role\s+to\s+["']?([^"'\n,]+?)["']?/i);
    if (roleChangeMatch) {
      employeeName = roleChangeMatch[1].trim();
      newRole = roleChangeMatch[2].trim();
    }
    
    // Pattern: "move [name] to [department]"
    const deptMoveMatch = message.match(/move\s+["']?([^"'\n,]+?)["']?\s+to\s+(?:the\s+)?["']?([^"'\n,]+?)["']?\s*(?:department|team)?/i);
    if (deptMoveMatch) {
      employeeName = deptMoveMatch[1].trim();
      newDepartment = deptMoveMatch[2].trim();
    }
    
    // Pattern: "change [name]'s department to [department]"
    const deptChangeMatch = message.match(/change\s+["']?([^"'\n,]+?)["']?(?:'s)?\s+department\s+to\s+["']?([^"'\n,]+?)["']?/i);
    if (deptChangeMatch) {
      employeeName = deptChangeMatch[1].trim();
      newDepartment = deptChangeMatch[2].trim();
    }
    
    // Generic update patterns: "update [name] role to [role]"
    const genericRoleMatch = message.match(/(?:update|set)\s+["']?([^"'\n,]+?)["']?\s+role\s+(?:to|as)\s+["']?([^"'\n,]+?)["']?/i);
    if (genericRoleMatch) {
      employeeName = genericRoleMatch[1].trim();
      newRole = genericRoleMatch[2].trim();
    }
    
    // Pattern: "to [role]" if role not already set
    if (!newRole && !newName && !newDepartment) {
      const toMatch = message.match(/\bto\s+(?:a\s+)?["']?([^"'\n,]+?)["']?$/i);
      if (toMatch) newRole = toMatch[1].trim();
    }
    
    return {
      isCommand: true,
      commandType: 'edit_employee',
      params: {
        employeeName,
        newName,
        newRole,
        newDepartment
      }
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
    
    // Extract the employee name to delete
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

    // Parse for commands
    const { isCommand, commandType, params } = parseCommand(message);
    let commandResult: CommandResult | null = null;

    // Execute commands if detected (some require authentication)
    if (isCommand) {
      // Commands that require authentication
      const authRequiredCommands = ['create_workflow', 'delete_workflow', 'create_employee', 'edit_employee', 'delete_employee', 'list_workflows', 'list_employees', 'visualize_data', 'list_connections', 'list_documents', 'data_overview'];
      
      if (authRequiredCommands.includes(commandType) && !isAuthenticated) {
        commandResult = { 
          type: 'info', 
          success: false, 
          message: 'Please log in to use this feature. You can sign up or log in to access all capabilities.' 
        };
      } else {
        switch (commandType) {
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
              // Find the employee by name (fuzzy match)
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
                  commandResult = { type: 'edit_employee', success: false, message: 'No changes specified. Please specify what to update (name, role, or department).' };
                }
              } else {
                commandResult = { type: 'edit_employee', success: false, message: `No employee found matching "${params.employeeName}". Say "list my team" to see all employees.` };
              }
            } else {
              commandResult = { type: 'edit_employee', success: false, message: 'Please specify the employee name to edit. For example: "edit employee Alex to Marketing Manager"' };
            }
            break;

          case 'delete_employee':
            if (params.employeeName) {
              // Find the employee by name (fuzzy match)
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
                    message: `Deleted AI employee "${employeeToDelete.name}" (${employeeToDelete.role} in ${employeeToDelete.department})` 
                  };
                }
              } else {
                commandResult = { type: 'delete_employee', success: false, message: `No employee found matching "${params.employeeName}". Say "list my team" to see all employees.` };
              }
            } else {
              commandResult = { type: 'delete_employee', success: false, message: 'Please specify the employee name to delete. For example: "delete employee Alex"' };
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
            // Get metrics for visualization
            const { data: metricsData } = await supabase
              .from('business_metrics')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(20);
            
            commandResult = { type: 'data', success: true, data: metricsData };
            break;

          case 'list_connections':
            // Get all API connections for the user
            const { data: connections } = await supabase
              .from('api_connections')
              .select('id, name, provider, status, last_sync_at, api_endpoint')
              .eq('user_id', userId)
              .order('created_at', { ascending: false });
            
            commandResult = { 
              type: 'connections', 
              success: true, 
              data: connections || [], 
              message: 'connections_list' 
            };
            break;

          case 'list_documents':
            // Get all uploaded documents/business plans
            const { data: documents } = await supabase
              .from('business_plans')
              .select('id, title, description, created_at, updated_at')
              .eq('user_id', userId)
              .order('created_at', { ascending: false });
            
            // Get website analyses too
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
            // Comprehensive data overview
            const [
              { data: overviewConnections },
              { data: overviewDocs },
              { data: overviewWebsites },
              { data: overviewMetrics },
              { data: overviewWorkflows },
              { data: overviewEmployees }
            ] = await Promise.all([
              supabase.from('api_connections').select('id, name, provider, status').eq('user_id', userId),
              supabase.from('business_plans').select('id, title, description').eq('user_id', userId),
              supabase.from('website_analyses').select('id, website_url, analysis_content').eq('user_id', userId),
              supabase.from('business_metrics').select('metric_name, value, change_percentage, period').eq('user_id', userId).limit(20),
              supabase.from('ai_workflows').select('id, name, status, run_count').eq('user_id', userId),
              supabase.from('ai_employees').select('id, name, role, department').eq('user_id', userId)
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
                employees: overviewEmployees || []
              }, 
              message: 'data_overview'
          };
          break;
        }
      }
    }

    // Build context for AI based on current business data
    let context = "You are Sibe SI (Synthetic Intelligence Business Engine), an AI business partner with FULL CONTROL over the app. You can create workflows, AI employees, visualize data, check API connections, access uploaded documents, and answer all business questions.\n\n";
    
    // Add command capabilities info
    context += "=== YOUR CAPABILITIES ===\n";
    context += "1. Create workflows: User can say 'create workflow for...' or 'build workflow named...'\n";
    context += "2. Create AI employees: User can say 'hire a marketing manager' or 'create an AI accountant'\n";
    context += "3. Edit AI employees: User can say 'edit employee [name] role to [new role]', 'rename employee [name] to [new name]', 'move [name] to [department]'\n";
    context += "4. Delete workflows: User can say 'delete workflow [name]'\n";
    context += "5. Visualize data: User can say 'show me revenue trends' or 'graph customer growth'\n";
    context += "6. Check API connections: User can say 'show my connected APIs' or 'check data sources'\n";
    context += "7. View documents: User can say 'show my documents' or 'what data have I uploaded'\n";
    context += "8. Data overview: User can say 'show all my data' or 'give me a data overview'\n";
    context += "9. List resources: User can say 'show my workflows' or 'list my team'\n\n";

    // Add command result to context
    if (commandResult) {
      context += "=== COMMAND EXECUTED ===\n";
      context += `Action: ${commandResult.type}\n`;
      context += `Success: ${commandResult.success}\n`;
      if (commandResult.message) {
        context += `Result: ${commandResult.message}\n`;
      }
      if (commandResult.data) {
        context += `Data: ${JSON.stringify(commandResult.data).substring(0, 1000)}\n`;
      }
      context += "\n";
    }

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

    // Include workflows info
    if (businessContext?.workflows && businessContext.workflows.length > 0) {
      hasBusinessData = true;
      context += "=== ACTIVE WORKFLOWS ===\n";
      businessContext.workflows.forEach((w: any) => {
        context += `- ${w.name} (${w.status}) - ${w.run_count} runs\n`;
      });
      context += "\n";
    }

    // Include AI employees info
    if (businessContext?.employees && businessContext.employees.length > 0) {
      hasBusinessData = true;
      context += "=== AI TEAM ===\n";
      businessContext.employees.forEach((e: any) => {
        context += `- ${e.name}: ${e.role} in ${e.department}\n`;
      });
      context += "\n";
    }

    // Include API connections info
    if (businessContext?.apiConnections && businessContext.apiConnections.length > 0) {
      hasBusinessData = true;
      context += "=== CONNECTED APIS & DATA SOURCES ===\n";
      businessContext.apiConnections.forEach((c: any) => {
        context += `- ${c.name} (${c.provider}): ${c.status}`;
        if (c.last_sync_at) {
          context += ` - Last sync: ${c.last_sync_at}`;
        }
        context += "\n";
      });
      context += "\n";
    }

    if (!hasBusinessData && !commandResult) {
      context += "NOTE: No business data has been uploaded yet. The user needs to:\n";
      context += "1. Upload a business plan/document, OR\n";
      context += "2. Analyze their website, OR\n";
      context += "3. Input their business metrics, OR\n";
      context += "4. Connect external APIs/data sources\n\n";
    }

    context += "IMPORTANT: Be concise, actionable, and helpful. If a command was executed, confirm the result clearly. For visualizations, describe what data is being shown. When showing API connections or documents, summarize what the user has and suggest how to use them. Always offer to help with next steps.";

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
      JSON.stringify({ 
        response: aiResponse,
        commandResult: commandResult 
      }),
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
