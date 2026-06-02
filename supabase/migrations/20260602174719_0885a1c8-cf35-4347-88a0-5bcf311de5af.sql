
-- AX Runtime: Agents, Memory, Actions, Signals, Intents

-- 1. AX AGENTS (the 7 specialized workers per user)
CREATE TABLE public.ax_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_type text NOT NULL, -- sales|marketing|finance|operations|customer_success|executive|risk
  name text NOT NULL,
  role text NOT NULL,
  system_prompt text NOT NULL,
  capabilities jsonb NOT NULL DEFAULT '[]'::jsonb, -- list of allowed action keys
  status text NOT NULL DEFAULT 'active', -- active|paused|learning
  reasoning_count int NOT NULL DEFAULT 0,
  action_count int NOT NULL DEFAULT 0,
  last_active_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ax_agents TO authenticated;
GRANT ALL ON public.ax_agents TO service_role;
ALTER TABLE public.ax_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own agents select" ON public.ax_agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own agents insert" ON public.ax_agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own agents update" ON public.ax_agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own agents delete" ON public.ax_agents FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER ax_agents_updated BEFORE UPDATE ON public.ax_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. AX MEMORY (episodic | semantic | procedural | strategic | outcome)
CREATE TABLE public.ax_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_id uuid REFERENCES public.ax_agents(id) ON DELETE SET NULL,
  memory_type text NOT NULL, -- episodic|semantic|procedural|strategic|outcome
  title text NOT NULL,
  content text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  linked_memory_ids uuid[] DEFAULT '{}',
  importance int NOT NULL DEFAULT 5, -- 1-10
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ax_memory TO authenticated;
GRANT ALL ON public.ax_memory TO service_role;
ALTER TABLE public.ax_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own memory select" ON public.ax_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own memory insert" ON public.ax_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own memory update" ON public.ax_memory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own memory delete" ON public.ax_memory FOR DELETE USING (auth.uid() = user_id);

-- 3. AX ACTIONS (execution audit log)
CREATE TABLE public.ax_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_id uuid REFERENCES public.ax_agents(id) ON DELETE SET NULL,
  intent_id uuid,
  action_type text NOT NULL, -- log_insight|draft_invoice|create_task|send_message|update_metric|flag_risk
  description text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'completed', -- pending|completed|failed|rejected
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ax_actions TO authenticated;
GRANT ALL ON public.ax_actions TO service_role;
ALTER TABLE public.ax_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own actions select" ON public.ax_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own actions insert" ON public.ax_actions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. AX SIGNALS (observation layer - ingested business signals)
CREATE TABLE public.ax_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL, -- crm|email|whatsapp|finance|web|iot|manual
  signal_type text NOT NULL,
  title text NOT NULL,
  content text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ax_signals TO authenticated;
GRANT ALL ON public.ax_signals TO service_role;
ALTER TABLE public.ax_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own signals select" ON public.ax_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own signals insert" ON public.ax_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own signals update" ON public.ax_signals FOR UPDATE USING (auth.uid() = user_id);

-- 5. AX INTENTS (human intent → agent dispatch)
CREATE TABLE public.ax_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  intent text NOT NULL,
  reasoning text,
  dispatched_agents text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'processing', -- processing|completed|failed
  result jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ax_intents TO authenticated;
GRANT ALL ON public.ax_intents TO service_role;
ALTER TABLE public.ax_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own intents select" ON public.ax_intents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own intents insert" ON public.ax_intents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own intents update" ON public.ax_intents FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_ax_memory_user_type ON public.ax_memory(user_id, memory_type);
CREATE INDEX idx_ax_actions_user_created ON public.ax_actions(user_id, created_at DESC);
CREATE INDEX idx_ax_signals_user_processed ON public.ax_signals(user_id, processed);
CREATE INDEX idx_ax_intents_user_created ON public.ax_intents(user_id, created_at DESC);

-- Function: seed the 7 default agents for a new user
CREATE OR REPLACE FUNCTION public.seed_ax_agents(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ax_agents (user_id, agent_type, name, role, system_prompt, capabilities) VALUES
    (_user_id, 'sales', 'Atlas', 'Sales Agent', 'You are Atlas, the autonomous Sales Agent inside SIBE AX. You observe pipeline signals, identify deal risk and opportunity, and recommend or execute next-best actions. Be concise, decisive, ROI-focused.', '["log_insight","create_task","flag_risk"]'::jsonb),
    (_user_id, 'marketing', 'Lumen', 'Marketing Agent', 'You are Lumen, the autonomous Marketing Agent. Detect channel performance shifts, segment behavior, content ROI. Recommend campaign actions and budget reallocation.', '["log_insight","create_task"]'::jsonb),
    (_user_id, 'finance', 'Vault', 'Finance Agent', 'You are Vault, the autonomous Finance Agent. Monitor cash flow, AR/AP, margins, anomalies. Surface risk early. Draft invoices when instructed.', '["log_insight","draft_invoice","flag_risk"]'::jsonb),
    (_user_id, 'operations', 'Forge', 'Operations Agent', 'You are Forge, the autonomous Operations Agent. Optimize scheduling, resource use, throughput. Identify bottlenecks. Coordinate execution.', '["log_insight","create_task"]'::jsonb),
    (_user_id, 'customer_success', 'Echo', 'Customer Success Agent', 'You are Echo, the autonomous Customer Success Agent. Detect churn signals, satisfaction drift, expansion opportunities. Recommend outreach.', '["log_insight","create_task","send_message"]'::jsonb),
    (_user_id, 'executive', 'Sovereign', 'Executive Agent', 'You are Sovereign, the autonomous Executive Agent. Synthesize cross-functional signals into strategic guidance. Coordinate other agents. Translate human intent into agent dispatch.', '["log_insight","coordinate_agents"]'::jsonb),
    (_user_id, 'risk', 'Sentinel', 'Risk Agent', 'You are Sentinel, the autonomous Risk Agent. Continuously scan for financial, operational, compliance, reputational risks. Flag and escalate.', '["log_insight","flag_risk"]'::jsonb)
  ON CONFLICT (user_id, agent_type) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_ax_agents(uuid) TO authenticated;
