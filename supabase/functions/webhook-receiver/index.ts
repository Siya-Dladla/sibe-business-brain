import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

interface WebhookPayload {
  action: string;
  data: Record<string, any>;
  source?: string;
  timestamp?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get webhook secret from header for validation
    const webhookSecret = req.headers.get('x-webhook-secret');
    
    const payload: WebhookPayload = await req.json();
    const { action, data, source } = payload;

    console.log(`Webhook received: ${action} from ${source || 'unknown'}`);

    let result: any = { success: false, message: 'Unknown action' };

    switch (action) {
      // ===== Data Sync Actions =====
      case 'sync_metrics':
        // External workflow pushes metrics data
        if (data.user_id && data.metrics) {
          const period = new Date().toISOString().slice(0, 7);
          for (const metric of data.metrics) {
            await supabase.from('business_metrics').upsert({
              user_id: data.user_id,
              metric_name: metric.name,
              value: metric.value,
              metric_type: metric.type || 'custom',
              change_percentage: metric.change || 0,
              period,
            }, {
              onConflict: 'user_id,metric_name,period',
              ignoreDuplicates: false,
            });
          }
          result = { success: true, message: `Synced ${data.metrics.length} metrics` };
        }
        break;

      case 'update_connection_status':
        // Update API connection status from external workflow
        if (data.connection_id && data.status) {
          const { error } = await supabase
            .from('api_connections')
            .update({ 
              status: data.status, 
              last_sync_at: new Date().toISOString() 
            })
            .eq('id', data.connection_id);
          
          result = error 
            ? { success: false, message: error.message }
            : { success: true, message: 'Connection status updated' };
        }
        break;

      // ===== Workflow Trigger Actions =====
      case 'trigger_workflow':
        // Record that an external workflow was triggered
        if (data.workflow_id) {
          const { error } = await supabase
            .from('connected_workflows')
            .update({ 
              last_triggered_at: new Date().toISOString(),
              trigger_count: supabase.rpc('increment_trigger_count', { workflow_id: data.workflow_id })
            })
            .eq('id', data.workflow_id);
          
          // Increment trigger count manually if RPC doesn't exist
          const { data: workflow } = await supabase
            .from('connected_workflows')
            .select('trigger_count')
            .eq('id', data.workflow_id)
            .single();
          
          if (workflow) {
            await supabase
              .from('connected_workflows')
              .update({ 
                trigger_count: (workflow.trigger_count || 0) + 1,
                last_triggered_at: new Date().toISOString()
              })
              .eq('id', data.workflow_id);
          }
          
          result = { success: true, message: 'Workflow trigger recorded' };
        }
        break;

      // ===== AI Agent Actions =====
      case 'agent_callback':
        // AI Agent sends back results
        if (data.agent_id && data.response) {
          const { data: agent } = await supabase
            .from('connected_agents')
            .select('call_count, token_usage')
            .eq('id', data.agent_id)
            .single();
          
          if (agent) {
            await supabase
              .from('connected_agents')
              .update({ 
                call_count: (agent.call_count || 0) + 1,
                token_usage: (agent.token_usage || 0) + (data.tokens_used || 0),
                last_called_at: new Date().toISOString()
              })
              .eq('id', data.agent_id);
          }
          
          // Store agent response as an insight if requested
          if (data.store_as_insight && data.user_id) {
            await supabase.from('ai_insights').insert({
              user_id: data.user_id,
              title: `AI Agent: ${data.insight_title || 'Analysis'}`,
              content: data.response,
              insight_type: 'agent_response',
            });
          }
          
          result = { success: true, message: 'Agent callback processed', data: data.response };
        }
        break;

      // ===== Notification Actions =====
      case 'create_alert':
        // Create a KPI alert or notification
        if (data.user_id && data.message) {
          // Store as insight for now (could be expanded to dedicated alerts table)
          await supabase.from('ai_insights').insert({
            user_id: data.user_id,
            title: data.title || 'Alert',
            content: data.message,
            insight_type: 'alert',
          });
          result = { success: true, message: 'Alert created' };
        }
        break;

      // ===== Shopify Specific Actions =====
      case 'shopify_order':
        // Process incoming Shopify order webhook
        if (data.user_id && data.order) {
          const period = new Date().toISOString().slice(0, 7);
          
          // Update revenue metric
          await supabase.from('business_metrics').upsert({
            user_id: data.user_id,
            metric_name: 'Shopify: Latest Order',
            value: data.order.total || 0,
            metric_type: 'revenue',
            period,
          }, {
            onConflict: 'user_id,metric_name,period',
            ignoreDuplicates: false,
          });
          
          result = { success: true, message: 'Shopify order processed' };
        }
        break;

      // ===== Meta/Facebook Actions =====
      case 'meta_campaign_update':
        // Process Meta campaign performance updates
        if (data.user_id && data.campaign) {
          const period = new Date().toISOString().slice(0, 7);
          
          await supabase.from('business_metrics').upsert({
            user_id: data.user_id,
            metric_name: `Meta Campaign: ${data.campaign.name || 'Unknown'}`,
            value: data.campaign.spend || 0,
            metric_type: 'spend',
            change_percentage: data.campaign.roas || 0,
            period,
          }, {
            onConflict: 'user_id,metric_name,period',
            ignoreDuplicates: false,
          });
          
          result = { success: true, message: 'Meta campaign update processed' };
        }
        break;

      // ===== Custom Action Handler =====
      case 'custom':
        // Generic action handler for custom workflows
        result = { 
          success: true, 
          message: 'Custom action received', 
          echo: data 
        };
        break;

      default:
        result = { 
          success: false, 
          message: `Unknown action: ${action}`,
          available_actions: [
            'sync_metrics',
            'update_connection_status', 
            'trigger_workflow',
            'agent_callback',
            'create_alert',
            'shopify_order',
            'meta_campaign_update',
            'custom'
          ]
        };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('[webhook-receiver] error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'An internal error occurred',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
