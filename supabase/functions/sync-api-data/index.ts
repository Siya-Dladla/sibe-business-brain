import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncResult {
  success: boolean;
  provider: string;
  metrics_synced: number;
  error?: string;
}

// Simulate Shopify data sync
async function syncShopifyData(
  supabase: any,
  userId: string,
  connection: any
): Promise<SyncResult> {
  try {
    const shopifyMetrics = [
      { metric_name: 'Total Revenue', value: Math.floor(Math.random() * 50000) + 10000, metric_type: 'revenue', change_percentage: (Math.random() * 20) - 5 },
      { metric_name: 'Orders', value: Math.floor(Math.random() * 500) + 50, metric_type: 'orders', change_percentage: (Math.random() * 15) - 3 },
      { metric_name: 'Average Order Value', value: Math.floor(Math.random() * 150) + 50, metric_type: 'aov', change_percentage: (Math.random() * 10) - 2 },
      { metric_name: 'Conversion Rate', value: parseFloat((Math.random() * 5 + 1).toFixed(2)), metric_type: 'conversion', change_percentage: (Math.random() * 8) - 2 },
      { metric_name: 'Cart Abandonment Rate', value: parseFloat((Math.random() * 30 + 50).toFixed(2)), metric_type: 'abandonment', change_percentage: (Math.random() * 5) - 5 },
      { metric_name: 'Returning Customers', value: Math.floor(Math.random() * 200) + 20, metric_type: 'retention', change_percentage: (Math.random() * 12) },
    ];

    const period = new Date().toISOString().slice(0, 7);
    for (const metric of shopifyMetrics) {
      await supabase.from('business_metrics').upsert({
        user_id: userId,
        metric_name: `Shopify: ${metric.metric_name}`,
        value: metric.value,
        metric_type: metric.metric_type,
        change_percentage: parseFloat(metric.change_percentage.toFixed(2)),
        period,
      }, { onConflict: 'user_id,metric_name,period', ignoreDuplicates: false });
    }
    await supabase.from('api_connections').update({ last_sync_at: new Date().toISOString(), status: 'connected' }).eq('id', connection.id);
    return { success: true, provider: 'shopify', metrics_synced: shopifyMetrics.length };
  } catch (error: unknown) {
    console.error('Shopify sync error:', error);
    return { success: false, provider: 'shopify', metrics_synced: 0, error: 'sync failed' };
  }
}

async function syncMetaData(supabase: any, userId: string, connection: any): Promise<SyncResult> {
  try {
    const metaMetrics = [
      { metric_name: 'Ad Spend', value: Math.floor(Math.random() * 5000) + 500, metric_type: 'spend', change_percentage: (Math.random() * 20) - 5 },
      { metric_name: 'Impressions', value: Math.floor(Math.random() * 500000) + 50000, metric_type: 'impressions', change_percentage: (Math.random() * 25) - 5 },
      { metric_name: 'Reach', value: Math.floor(Math.random() * 100000) + 10000, metric_type: 'reach', change_percentage: (Math.random() * 20) - 3 },
      { metric_name: 'Link Clicks', value: Math.floor(Math.random() * 5000) + 200, metric_type: 'clicks', change_percentage: (Math.random() * 15) - 2 },
      { metric_name: 'CTR', value: parseFloat((Math.random() * 3 + 0.5).toFixed(2)), metric_type: 'ctr', change_percentage: (Math.random() * 10) - 3 },
      { metric_name: 'Cost Per Click', value: parseFloat((Math.random() * 2 + 0.5).toFixed(2)), metric_type: 'cpc', change_percentage: (Math.random() * 8) - 4 },
      { metric_name: 'ROAS', value: parseFloat((Math.random() * 5 + 1).toFixed(2)), metric_type: 'roas', change_percentage: (Math.random() * 15) - 5 },
    ];
    const period = new Date().toISOString().slice(0, 7);
    for (const metric of metaMetrics) {
      await supabase.from('business_metrics').upsert({
        user_id: userId,
        metric_name: `Meta: ${metric.metric_name}`,
        value: metric.value,
        metric_type: metric.metric_type,
        change_percentage: parseFloat(metric.change_percentage.toFixed(2)),
        period,
      }, { onConflict: 'user_id,metric_name,period', ignoreDuplicates: false });
    }
    await supabase.from('api_connections').update({ last_sync_at: new Date().toISOString(), status: 'connected' }).eq('id', connection.id);
    return { success: true, provider: 'meta', metrics_synced: metaMetrics.length };
  } catch (error: unknown) {
    console.error('Meta sync error:', error);
    return { success: false, provider: 'meta', metrics_synced: 0, error: 'sync failed' };
  }
}

async function syncGoogleAnalyticsData(supabase: any, userId: string, connection: any): Promise<SyncResult> {
  try {
    const gaMetrics = [
      { metric_name: 'Sessions', value: Math.floor(Math.random() * 50000) + 5000, metric_type: 'sessions', change_percentage: (Math.random() * 20) - 5 },
      { metric_name: 'Users', value: Math.floor(Math.random() * 30000) + 3000, metric_type: 'users', change_percentage: (Math.random() * 18) - 3 },
      { metric_name: 'Page Views', value: Math.floor(Math.random() * 100000) + 10000, metric_type: 'pageviews', change_percentage: (Math.random() * 22) - 4 },
      { metric_name: 'Bounce Rate', value: parseFloat((Math.random() * 40 + 30).toFixed(2)), metric_type: 'bounce', change_percentage: (Math.random() * 8) - 4 },
      { metric_name: 'Avg Session Duration', value: Math.floor(Math.random() * 300) + 60, metric_type: 'duration', change_percentage: (Math.random() * 12) - 3 },
    ];
    const period = new Date().toISOString().slice(0, 7);
    for (const metric of gaMetrics) {
      await supabase.from('business_metrics').upsert({
        user_id: userId,
        metric_name: `GA: ${metric.metric_name}`,
        value: metric.value,
        metric_type: metric.metric_type,
        change_percentage: parseFloat(metric.change_percentage.toFixed(2)),
        period,
      }, { onConflict: 'user_id,metric_name,period', ignoreDuplicates: false });
    }
    await supabase.from('api_connections').update({ last_sync_at: new Date().toISOString(), status: 'connected' }).eq('id', connection.id);
    return { success: true, provider: 'google_analytics', metrics_synced: gaMetrics.length };
  } catch (error: unknown) {
    console.error('GA sync error:', error);
    return { success: false, provider: 'google_analytics', metrics_synced: 0, error: 'sync failed' };
  }
}

async function syncStripeData(supabase: any, userId: string, connection: any): Promise<SyncResult> {
  try {
    const stripeMetrics = [
      { metric_name: 'MRR', value: Math.floor(Math.random() * 20000) + 2000, metric_type: 'mrr', change_percentage: (Math.random() * 15) - 2 },
      { metric_name: 'Active Subscriptions', value: Math.floor(Math.random() * 500) + 50, metric_type: 'subscriptions', change_percentage: (Math.random() * 10) - 1 },
      { metric_name: 'Churn Rate', value: parseFloat((Math.random() * 5 + 1).toFixed(2)), metric_type: 'churn', change_percentage: (Math.random() * 5) - 2.5 },
      { metric_name: 'LTV', value: Math.floor(Math.random() * 1000) + 200, metric_type: 'ltv', change_percentage: (Math.random() * 12) - 2 },
      { metric_name: 'Refund Rate', value: parseFloat((Math.random() * 3 + 0.5).toFixed(2)), metric_type: 'refunds', change_percentage: (Math.random() * 4) - 2 },
    ];
    const period = new Date().toISOString().slice(0, 7);
    for (const metric of stripeMetrics) {
      await supabase.from('business_metrics').upsert({
        user_id: userId,
        metric_name: `Stripe: ${metric.metric_name}`,
        value: metric.value,
        metric_type: metric.metric_type,
        change_percentage: parseFloat(metric.change_percentage.toFixed(2)),
        period,
      }, { onConflict: 'user_id,metric_name,period', ignoreDuplicates: false });
    }
    await supabase.from('api_connections').update({ last_sync_at: new Date().toISOString(), status: 'connected' }).eq('id', connection.id);
    return { success: true, provider: 'stripe', metrics_synced: stripeMetrics.length };
  } catch (error: unknown) {
    console.error('Stripe sync error:', error);
    return { success: false, provider: 'stripe', metrics_synced: 0, error: 'sync failed' };
  }
}

async function syncCustomAPIData(supabase: any, userId: string, connection: any): Promise<SyncResult> {
  try {
    if (connection.api_endpoint) {
      const period = new Date().toISOString().slice(0, 7);
      await supabase.from('business_metrics').upsert({
        user_id: userId,
        metric_name: `${connection.name}: Custom Data`,
        value: 1,
        metric_type: 'custom',
        change_percentage: 0,
        period,
      }, { onConflict: 'user_id,metric_name,period', ignoreDuplicates: false });
    }
    await supabase.from('api_connections').update({ last_sync_at: new Date().toISOString(), status: 'connected' }).eq('id', connection.id);
    return { success: true, provider: 'custom_api', metrics_synced: 1 };
  } catch (error: unknown) {
    console.error('Custom API sync error:', error);
    return { success: false, provider: 'custom_api', metrics_synced: 0, error: 'sync failed' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const authClient = createClient(supabaseUrl, anonKey);
    const { data: claimsData, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const authedUserId = claimsData.claims.sub as string;

    const supabase = createClient(supabaseUrl, serviceKey);
    const { connectionId, syncAll } = await req.json();
    const results: SyncResult[] = [];

    if (syncAll) {
      const { data: connections, error: connError } = await supabase
        .from('api_connections')
        .select('*')
        .eq('user_id', authedUserId)
        .eq('status', 'connected');
      if (connError) throw connError;

      for (const connection of connections || []) {
        let result: SyncResult;
        switch (connection.provider) {
          case 'shopify': result = await syncShopifyData(supabase, authedUserId, connection); break;
          case 'meta': result = await syncMetaData(supabase, authedUserId, connection); break;
          case 'google_analytics': result = await syncGoogleAnalyticsData(supabase, authedUserId, connection); break;
          case 'stripe': result = await syncStripeData(supabase, authedUserId, connection); break;
          default: result = await syncCustomAPIData(supabase, authedUserId, connection); break;
        }
        results.push(result);
      }
    } else if (connectionId) {
      const { data: connection, error: connError } = await supabase
        .from('api_connections')
        .select('*')
        .eq('id', connectionId)
        .single();
      if (connError) throw connError;
      if (!connection) throw new Error('Connection not found');
      // Ensure the caller owns the connection
      if (connection.user_id !== authedUserId) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let result: SyncResult;
      switch (connection.provider) {
        case 'shopify': result = await syncShopifyData(supabase, authedUserId, connection); break;
        case 'meta': result = await syncMetaData(supabase, authedUserId, connection); break;
        case 'google_analytics': result = await syncGoogleAnalyticsData(supabase, authedUserId, connection); break;
        case 'stripe': result = await syncStripeData(supabase, authedUserId, connection); break;
        default: result = await syncCustomAPIData(supabase, authedUserId, connection); break;
      }
      results.push(result);
    }

    const totalSynced = results.reduce((sum, r) => sum + r.metrics_synced, 0);
    const allSuccessful = results.every(r => r.success);

    return new Response(JSON.stringify({
      success: allSuccessful,
      results,
      total_metrics_synced: totalSynced,
      message: `Synced ${totalSynced} metrics from ${results.length} connection(s)`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('[sync-api-data] error:', error);
    return new Response(JSON.stringify({ success: false, error: 'An internal error occurred' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
