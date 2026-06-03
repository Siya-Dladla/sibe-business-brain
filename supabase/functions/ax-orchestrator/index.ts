// SIBE AX Orchestrator - routes human intent to agent swarm,
// reasons with Lovable AI, executes safe actions, writes memory + audit.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const AGENT_ROUTE_HINTS: Record<string, string[]> = {
  sales: ["sale", "deal", "lead", "pipeline", "revenue", "close", "quote"],
  marketing: ["campaign", "ads", "marketing", "brand", "audience", "content", "channel"],
  finance: ["cash", "invoice", "payment", "margin", "expense", "budget", "profit", "ar", "ap"],
  operations: ["schedul", "operation", "bottleneck", "throughput", "technician", "job", "resource"],
  customer_success: ["churn", "customer", "support", "satisfaction", "onboard", "retention"],
  executive: ["strategy", "quarter", "overall", "company", "vision", "objective", "goal"],
  risk: ["risk", "compliance", "fraud", "danger", "threat", "anomaly", "issue"],
};

function pickAgents(intent: string): string[] {
  const lower = intent.toLowerCase();
  const picked = new Set<string>();
  for (const [agent, words] of Object.entries(AGENT_ROUTE_HINTS)) {
    if (words.some(w => lower.includes(w))) picked.add(agent);
  }
  // Sovereign always coordinates
  picked.add("executive");
  return Array.from(picked);
}

const SAFE_ACTIONS = new Set([
  "log_insight",
  "create_task",
  "flag_risk",
  "draft_invoice",
  "send_message",
  "update_metric",
  "coordinate_agents",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub;

    const body = await req.json().catch(() => ({}));
    const intent = String(body.intent ?? "").trim();
    if (!intent || intent.length < 3 || intent.length > 2000) {
      return new Response(JSON.stringify({ error: "Invalid intent" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure agents exist (idempotent)
    await supabase.rpc("seed_ax_agents", { _user_id: userId });

    // Pick agents
    const agentTypes = pickAgents(intent);

    // Create intent record
    const { data: intentRow } = await supabase
      .from("ax_intents")
      .insert({ user_id: userId, intent, dispatched_agents: agentTypes, status: "processing" })
      .select()
      .single();
    const intentId = intentRow?.id;

    // Load agents
    const { data: agents } = await supabase
      .from("ax_agents")
      .select("id, agent_type, name, role, system_prompt, capabilities")
      .eq("user_id", userId)
      .in("agent_type", agentTypes);

    // Load recent memory + signals for context
    const [{ data: memory }, { data: signals }] = await Promise.all([
      supabase.from("ax_memory").select("memory_type,title,content").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("ax_signals").select("source,signal_type,title,content").eq("user_id", userId).order("created_at", { ascending: false }).limit(15),
    ]);

    const contextBlock = `
KNOWN MEMORY:
${(memory ?? []).map(m => `- [${m.memory_type}] ${m.title}: ${m.content}`).join("\n") || "(none yet)"}

RECENT SIGNALS:
${(signals ?? []).map(s => `- [${s.source}/${s.signal_type}] ${s.title}: ${s.content ?? ""}`).join("\n") || "(none yet)"}
`.trim();

    // Each agent reasons & emits actions via tool calling
    const agentResults: any[] = [];
    for (const agent of agents ?? []) {
      const tools = [{
        type: "function",
        function: {
          name: "agent_response",
          description: "Return the agent's reasoning and the safe actions to take.",
          parameters: {
            type: "object",
            properties: {
              reasoning: { type: "string", description: "Short reasoning for the human supervisor (1-3 sentences)." },
              actions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    action_type: { type: "string", enum: Array.from(SAFE_ACTIONS) },
                    description: { type: "string" },
                    payload: { type: "object", additionalProperties: true },
                  },
                  required: ["action_type", "description"],
                  additionalProperties: false,
                },
              },
              memory_to_store: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    memory_type: { type: "string", enum: ["episodic", "semantic", "procedural", "strategic", "outcome"] },
                    title: { type: "string" },
                    content: { type: "string" },
                    importance: { type: "integer", minimum: 1, maximum: 10 },
                  },
                  required: ["memory_type", "title", "content"],
                  additionalProperties: false,
                },
              },
            },
            required: ["reasoning", "actions"],
            additionalProperties: false,
          },
        },
      }];

      const messages = [
        { role: "system", content: `${agent.system_prompt}\n\nAllowed capabilities: ${JSON.stringify(agent.capabilities)}. Only emit actions from these capability keys. Be decisive but safe.` },
        { role: "user", content: `Human intent: "${intent}"\n\nContext:\n${contextBlock}\n\nRespond by calling agent_response.` },
      ];

      const aiRes = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          tools,
          tool_choice: { type: "function", function: { name: "agent_response" } },
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        console.error(`AI error for ${agent.name}:`, aiRes.status, errText);
        if (aiRes.status === 429 || aiRes.status === 402) {
          return new Response(JSON.stringify({
            error: aiRes.status === 429 ? "Rate limited" : "AI credits exhausted",
          }), { status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        continue;
      }

      const aiJson = await aiRes.json();
      const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) continue;
      let parsed: any;
      try { parsed = JSON.parse(toolCall.function.arguments); } catch { continue; }

      // Persist actions (filtered to capability whitelist)
      const allowed = new Set((agent.capabilities as string[]) ?? []);
      const acceptedActions = (parsed.actions ?? []).filter((a: any) =>
        SAFE_ACTIONS.has(a.action_type) && allowed.has(a.action_type)
      );

      if (acceptedActions.length) {
        await supabase.from("ax_actions").insert(
          acceptedActions.map((a: any) => ({
            user_id: userId,
            agent_id: agent.id,
            intent_id: intentId,
            action_type: a.action_type,
            description: a.description,
            payload: a.payload ?? {},
            status: "completed",
          }))
        );
      }

      // Persist memory
      if (parsed.memory_to_store?.length) {
        await supabase.from("ax_memory").insert(
          parsed.memory_to_store.map((m: any) => ({
            user_id: userId,
            agent_id: agent.id,
            memory_type: m.memory_type,
            title: m.title,
            content: m.content,
            importance: m.importance ?? 5,
          }))
        );
      }

      // Bump agent stats
      await supabase.from("ax_agents").update({
        reasoning_count: (agent as any).reasoning_count + 1,
        action_count: ((agent as any).action_count ?? 0) + acceptedActions.length,
        last_active_at: new Date().toISOString(),
      }).eq("id", agent.id);

      agentResults.push({
        agent: agent.name,
        agent_type: agent.agent_type,
        reasoning: parsed.reasoning,
        actions: acceptedActions,
      });
    }

    const summary = agentResults.map(r => `**${r.agent}** (${r.agent_type}): ${r.reasoning}`).join("\n\n");

    await supabase.from("ax_intents")
      .update({ status: "completed", reasoning: summary, result: { agents: agentResults }, completed_at: new Date().toISOString() })
      .eq("id", intentId);

    return new Response(JSON.stringify({
      intent_id: intentId,
      dispatched: agentTypes,
      summary,
      agents: agentResults,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("orchestrator error:", e);
    return new Response(JSON.stringify({ error: "Orchestrator failure" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
