-- Create security events table for anti-cheating system
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_agent TEXT,
  screen_resolution VARCHAR(20),
  window_size VARCHAR(20),
  mouse_position JSONB,
  keyboard_events JSONB,
  network_activity JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_session_id ON security_events(session_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);

-- Create security sessions table
CREATE TABLE IF NOT EXISTS security_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES code_challenges(id) ON DELETE CASCADE,
  session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('quiz', 'challenge')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  is_cheating_detected BOOLEAN DEFAULT FALSE,
  violation_count INTEGER DEFAULT 0,
  auto_submitted BOOLEAN DEFAULT FALSE,
  security_level VARCHAR(20) DEFAULT 'maximum',
  metadata JSONB DEFAULT '{}'
);

-- Create index for security sessions
CREATE INDEX IF NOT EXISTS idx_security_sessions_user_id ON security_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_security_sessions_quiz_id ON security_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_security_sessions_challenge_id ON security_sessions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_security_sessions_started_at ON security_sessions(started_at);

-- Update quiz_attempts table to include security information
-- Note: security_events column already exists as security_data in your schema
-- We'll add the missing security columns
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS is_cheating_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS violation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS security_session_id UUID REFERENCES security_sessions(id);

-- Update challenge_attempts table to include security information
-- Note: security_events column already exists in your schema
-- We'll add the missing security columns
ALTER TABLE challenge_attempts 
ADD COLUMN IF NOT EXISTS is_cheating_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS violation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS security_session_id UUID REFERENCES security_sessions(id);

-- Create security analytics view
CREATE OR REPLACE VIEW security_analytics AS
SELECT 
  se.user_id,
  u.email,
  se.session_id,
  ss.session_type,
  ss.quiz_id,
  ss.challenge_id,
  ss.started_at,
  ss.ended_at,
  ss.is_cheating_detected,
  ss.violation_count,
  ss.auto_submitted,
  COUNT(se.id) as total_events,
  COUNT(CASE WHEN se.severity = 'critical' THEN 1 END) as critical_violations,
  COUNT(CASE WHEN se.severity = 'high' THEN 1 END) as high_violations,
  COUNT(CASE WHEN se.severity = 'medium' THEN 1 END) as medium_violations,
  COUNT(CASE WHEN se.severity = 'low' THEN 1 END) as low_violations,
  EXTRACT(EPOCH FROM (ss.ended_at - ss.started_at)) as session_duration_seconds
FROM security_sessions ss
LEFT JOIN security_events se ON ss.id = se.session_id
LEFT JOIN auth.users u ON ss.user_id = u.id
GROUP BY se.user_id, u.email, se.session_id, ss.id, ss.session_type, ss.quiz_id, ss.challenge_id, ss.started_at, ss.ended_at, ss.is_cheating_detected, ss.violation_count, ss.auto_submitted;

-- Create RLS policies for security tables
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own security events
CREATE POLICY "Users can view their own security events" ON security_events
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own security events
CREATE POLICY "Users can insert their own security events" ON security_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to see their own security sessions
CREATE POLICY "Users can view their own security sessions" ON security_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own security sessions
CREATE POLICY "Users can insert their own security sessions" ON security_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own security sessions
CREATE POLICY "Users can update their own security sessions" ON security_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies (for administrators)
CREATE POLICY "Admins can view all security events" ON security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all security sessions" ON security_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_session_id UUID,
  p_event_type VARCHAR(50),
  p_severity VARCHAR(20),
  p_details TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO security_events (
    user_id,
    session_id,
    event_type,
    severity,
    details,
    metadata,
    user_agent,
    screen_resolution,
    window_size
  ) VALUES (
    auth.uid(),
    p_session_id,
    p_event_type,
    p_severity,
    p_details,
    p_metadata,
    current_setting('request.headers')::json->>'user-agent',
    current_setting('request.headers')::json->>'screen-resolution',
    current_setting('request.headers')::json->>'window-size'
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Create function to start security session
CREATE OR REPLACE FUNCTION start_security_session(
  p_quiz_id UUID DEFAULT NULL,
  p_challenge_id UUID DEFAULT NULL,
  p_session_type VARCHAR(20),
  p_security_level VARCHAR(20) DEFAULT 'maximum'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO security_sessions (
    user_id,
    quiz_id,
    challenge_id,
    session_type,
    security_level
  ) VALUES (
    auth.uid(),
    p_quiz_id,
    p_challenge_id,
    p_session_type,
    p_security_level
  ) RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$;

-- Create function to end security session
CREATE OR REPLACE FUNCTION end_security_session(
  p_session_id UUID,
  p_is_cheating_detected BOOLEAN DEFAULT FALSE,
  p_violation_count INTEGER DEFAULT 0,
  p_auto_submitted BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE security_sessions 
  SET 
    ended_at = NOW(),
    is_cheating_detected = p_is_cheating_detected,
    violation_count = p_violation_count,
    auto_submitted = p_auto_submitted
  WHERE id = p_session_id AND user_id = auth.uid();
END;
$$;

-- Create function to get security summary for a user
CREATE OR REPLACE FUNCTION get_security_summary(p_user_id UUID DEFAULT NULL)
RETURNS TABLE(
  total_sessions INTEGER,
  cheating_sessions INTEGER,
  total_violations INTEGER,
  critical_violations INTEGER,
  auto_submissions INTEGER,
  avg_session_duration_seconds NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_sessions,
    COUNT(CASE WHEN is_cheating_detected THEN 1 END)::INTEGER as cheating_sessions,
    COALESCE(SUM(violation_count), 0)::INTEGER as total_violations,
    COUNT(CASE WHEN auto_submitted THEN 1 END)::INTEGER as auto_submissions,
    AVG(EXTRACT(EPOCH FROM (ended_at - started_at)))::NUMERIC as avg_session_duration_seconds
  FROM security_sessions 
  WHERE user_id = COALESCE(p_user_id, auth.uid())
    AND ended_at IS NOT NULL;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON security_events TO authenticated;
GRANT ALL ON security_sessions TO authenticated;
GRANT SELECT ON security_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION start_security_session TO authenticated;
GRANT EXECUTE ON FUNCTION end_security_session TO authenticated;
GRANT EXECUTE ON FUNCTION get_security_summary TO authenticated; 