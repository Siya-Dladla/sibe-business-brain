-- Create table for AI automation workflows
CREATE TABLE public.ai_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual', -- manual, scheduled, event, data_change
  trigger_config JSONB DEFAULT '{}'::jsonb,
  nodes JSONB DEFAULT '[]'::jsonb, -- workflow nodes with connections
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, paused
  last_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for workflow execution logs
CREATE TABLE public.workflow_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.ai_workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'running', -- running, completed, failed
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  error TEXT,
  logs JSONB DEFAULT '[]'::jsonb
);

-- Create table for AI employee actions/capabilities
CREATE TABLE public.ai_employee_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.ai_employees(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- analyze_data, create_task, generate_report, send_alert
  action_config JSONB DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for API integrations/connections
CREATE TABLE public.api_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- stripe, google_analytics, custom
  api_endpoint TEXT,
  credentials_encrypted TEXT, -- encrypted API key
  status TEXT NOT NULL DEFAULT 'active', -- active, disconnected, error
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_employee_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_workflows
CREATE POLICY "Users can view their own workflows" 
ON public.ai_workflows FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows" 
ON public.ai_workflows FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows" 
ON public.ai_workflows FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows" 
ON public.ai_workflows FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for workflow_runs
CREATE POLICY "Users can view their workflow runs" 
ON public.workflow_runs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create workflow runs" 
ON public.workflow_runs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their workflow runs" 
ON public.workflow_runs FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for ai_employee_actions
CREATE POLICY "Users can view actions via employee ownership" 
ON public.ai_employee_actions FOR SELECT 
USING (employee_id IN (SELECT id FROM public.ai_employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can create actions for their employees" 
ON public.ai_employee_actions FOR INSERT 
WITH CHECK (employee_id IN (SELECT id FROM public.ai_employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can update actions for their employees" 
ON public.ai_employee_actions FOR UPDATE 
USING (employee_id IN (SELECT id FROM public.ai_employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete actions for their employees" 
ON public.ai_employee_actions FOR DELETE 
USING (employee_id IN (SELECT id FROM public.ai_employees WHERE user_id = auth.uid()));

-- RLS policies for api_connections
CREATE POLICY "Users can view their own connections" 
ON public.api_connections FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own connections" 
ON public.api_connections FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" 
ON public.api_connections FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" 
ON public.api_connections FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_ai_workflows_updated_at
BEFORE UPDATE ON public.ai_workflows
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_api_connections_updated_at
BEFORE UPDATE ON public.api_connections
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();