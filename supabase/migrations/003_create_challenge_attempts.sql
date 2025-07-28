-- Create challenge_attempts table
CREATE TABLE IF NOT EXISTS public.challenge_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL,
  submitted_code text NOT NULL,
  language text NOT NULL DEFAULT 'javascript',
  time_taken_seconds integer NOT NULL DEFAULT 0,
  is_successful boolean NOT NULL DEFAULT false,
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  security_events jsonb DEFAULT '[]'::jsonb,
  submitted_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT challenge_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT challenge_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT challenge_attempts_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.code_challenges(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user_id ON public.challenge_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_challenge_id ON public.challenge_attempts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_submitted_at ON public.challenge_attempts(submitted_at);

-- Enable RLS
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own challenge attempts" ON public.challenge_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge attempts" ON public.challenge_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge attempts" ON public.challenge_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_challenge_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_challenge_attempts_updated_at
  BEFORE UPDATE ON public.challenge_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_attempts_updated_at(); 