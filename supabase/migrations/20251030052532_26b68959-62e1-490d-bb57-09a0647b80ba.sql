-- Create AI employees table
CREATE TABLE public.ai_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL,
  personality TEXT,
  expertise TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI employees"
ON public.ai_employees FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI employees"
ON public.ai_employees FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI employees"
ON public.ai_employees FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI employees"
ON public.ai_employees FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_ai_employees_updated_at
BEFORE UPDATE ON public.ai_employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();