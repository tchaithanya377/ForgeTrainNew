-- Create security_events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    violations JSONB NOT NULL DEFAULT '[]',
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration INTEGER NOT NULL DEFAULT 0, -- duration in milliseconds
    terminated BOOLEAN NOT NULL DEFAULT false,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_session_id ON security_events(session_id);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_level ON security_events(risk_level);
CREATE INDEX IF NOT EXISTS idx_security_events_terminated ON security_events(terminated);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_security_events_updated_at 
    BEFORE UPDATE ON security_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own security events
CREATE POLICY "Users can view own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own security events
CREATE POLICY "Users can insert own security events" ON security_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all security events
CREATE POLICY "Admins can view all security events" ON security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Admins can update all security events
CREATE POLICY "Admins can update all security events" ON security_events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Create a view for security analytics
CREATE OR REPLACE VIEW security_analytics AS
SELECT 
    user_id,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE terminated = true) as terminated_sessions,
    COUNT(*) FILTER (WHERE risk_level = 'critical') as critical_violations,
    COUNT(*) FILTER (WHERE risk_level = 'high') as high_violations,
    COUNT(*) FILTER (WHERE risk_level = 'medium') as medium_violations,
    COUNT(*) FILTER (WHERE risk_level = 'low') as low_violations,
    AVG(duration) as avg_session_duration,
    MAX(timestamp) as last_event,
    MIN(timestamp) as first_event
FROM security_events
GROUP BY user_id;

-- Create a function to get violation statistics
CREATE OR REPLACE FUNCTION get_violation_stats(
    p_user_id UUID DEFAULT NULL,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    total_events BIGINT,
    terminated_sessions BIGINT,
    critical_violations BIGINT,
    high_violations BIGINT,
    medium_violations BIGINT,
    low_violations BIGINT,
    avg_session_duration NUMERIC,
    unique_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE terminated = true) as terminated_sessions,
        COUNT(*) FILTER (WHERE risk_level = 'critical') as critical_violations,
        COUNT(*) FILTER (WHERE risk_level = 'high') as high_violations,
        COUNT(*) FILTER (WHERE risk_level = 'medium') as medium_violations,
        COUNT(*) FILTER (WHERE risk_level = 'low') as low_violations,
        ROUND(AVG(duration)::NUMERIC, 2) as avg_session_duration,
        COUNT(DISTINCT user_id) as unique_users
    FROM security_events
    WHERE (p_user_id IS NULL OR user_id = p_user_id)
        AND (p_start_date IS NULL OR timestamp >= p_start_date)
        AND (p_end_date IS NULL OR timestamp <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON security_events TO authenticated;
GRANT SELECT ON security_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_violation_stats TO authenticated; 