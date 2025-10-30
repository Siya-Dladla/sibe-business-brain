-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  transcript TEXT,
  participants TEXT[],
  ai_recommendations TEXT,
  duration_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled',
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forecasts table
CREATE TABLE public.forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  forecast_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  predictions JSONB,
  confidence_score NUMERIC,
  time_horizon TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  data JSONB,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meetings
CREATE POLICY "Users can view their own meetings"
ON public.meetings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meetings"
ON public.meetings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meetings"
ON public.meetings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meetings"
ON public.meetings FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for forecasts
CREATE POLICY "Users can view their own forecasts"
ON public.forecasts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forecasts"
ON public.forecasts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forecasts"
ON public.forecasts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forecasts"
ON public.forecasts FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
ON public.reports FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
ON public.reports FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_meetings_updated_at
BEFORE UPDATE ON public.meetings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forecasts_updated_at
BEFORE UPDATE ON public.forecasts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();