-- Create connected_workflows table for external workflow platform connections
CREATE TABLE public.connected_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'n8n', 'make', 'zapier'
  workflow_name TEXT NOT NULL,
  workflow_id TEXT, -- External platform's workflow ID
  webhook_url TEXT, -- Webhook URL for triggering
  api_key_encrypted TEXT, -- Encrypted API key
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create connected_agents table for external AI agent connections
CREATE TABLE public.connected_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'openai', 'anthropic', 'langchain', etc.
  agent_name TEXT NOT NULL,
  agent_id TEXT, -- External platform's agent ID
  api_endpoint TEXT, -- API endpoint for the agent
  api_key_encrypted TEXT, -- Encrypted API key
  model TEXT, -- e.g., 'gpt-4', 'claude-3'
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  last_called_at TIMESTAMP WITH TIME ZONE,
  call_count INTEGER DEFAULT 0,
  token_usage INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_developers table
CREATE TABLE public.community_developers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT[] DEFAULT '{}', -- e.g., ['n8n', 'openai', 'langchain']
  description TEXT,
  profile_url TEXT,
  email TEXT,
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  hourly_rate DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add is_encrypted column to api_connections if not exists
ALTER TABLE public.api_connections 
ADD COLUMN IF NOT EXISTS is_multi_store BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS store_name TEXT,
ADD COLUMN IF NOT EXISTS sync_frequency TEXT DEFAULT 'hourly' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual'));

-- Enable RLS
ALTER TABLE public.connected_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_developers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connected_workflows
CREATE POLICY "Users can view their own connected workflows" 
ON public.connected_workflows FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own connected workflows" 
ON public.connected_workflows FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connected workflows" 
ON public.connected_workflows FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connected workflows" 
ON public.connected_workflows FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for connected_agents
CREATE POLICY "Users can view their own connected agents" 
ON public.connected_agents FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own connected agents" 
ON public.connected_agents FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connected agents" 
ON public.connected_agents FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connected agents" 
ON public.connected_agents FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for community_developers (publicly viewable, admin managed)
CREATE POLICY "Community developers are viewable by everyone" 
ON public.community_developers FOR SELECT USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_connected_workflows_updated_at
BEFORE UPDATE ON public.connected_workflows
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_connected_agents_updated_at
BEFORE UPDATE ON public.connected_agents
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_community_developers_updated_at
BEFORE UPDATE ON public.community_developers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample community developers
INSERT INTO public.community_developers (name, specialty, description, availability, hourly_rate, rating, review_count, verified)
VALUES 
  ('Alex Chen', ARRAY['n8n', 'zapier', 'make'], 'Workflow automation expert with 5+ years experience building complex integrations.', 'available', 75.00, 4.9, 127, true),
  ('Sarah Williams', ARRAY['openai', 'langchain', 'anthropic'], 'AI/ML specialist focused on building production-ready AI agents and chatbots.', 'available', 95.00, 4.8, 89, true),
  ('Marcus Johnson', ARRAY['shopify', 'meta', 'stripe'], 'E-commerce automation specialist. Shopify Partner and Meta Business certified.', 'busy', 85.00, 4.7, 156, true),
  ('Emma Rodriguez', ARRAY['crewai', 'autogen', 'huggingface'], 'Multi-agent systems developer. Expert in orchestrating AI teams.', 'available', 110.00, 5.0, 43, true),
  ('David Kim', ARRAY['n8n', 'openai', 'supabase'], 'Full-stack automation developer. Specializes in end-to-end workflow solutions.', 'available', 80.00, 4.6, 98, true);