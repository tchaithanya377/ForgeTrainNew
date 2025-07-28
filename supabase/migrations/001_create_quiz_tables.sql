-- Create quiz_attempts table for tracking quiz completion
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL DEFAULT false,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  answers JSONB,
  security_data JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at DESC);

-- Create RLS policies for quiz_attempts
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz attempts" ON quiz_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_quiz_attempts_updated_at 
  BEFORE UPDATE ON quiz_attempts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add columns to existing user_progress table if they don't exist
DO $$ 
BEGIN
    -- Add completed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'completed') THEN
        ALTER TABLE user_progress ADD COLUMN completed BOOLEAN DEFAULT false;
    END IF;
    
    -- Add score column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'score') THEN
        ALTER TABLE user_progress ADD COLUMN score INTEGER CHECK (score >= 0 AND score <= 100);
    END IF;
    
    -- Add completed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'completed_at') THEN
        ALTER TABLE user_progress ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add lesson_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'lesson_type') THEN
        ALTER TABLE user_progress ADD COLUMN lesson_type TEXT CHECK (lesson_type IN ('text_tutorial', 'video_tutorial', 'quiz', 'code_challenge'));
    END IF;
    
    -- Add module_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'module_id') THEN
        ALTER TABLE user_progress ADD COLUMN module_id UUID REFERENCES modules(id);
    END IF;
    
    -- Add lesson_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'lesson_id') THEN
        ALTER TABLE user_progress ADD COLUMN lesson_id UUID;
    END IF;
END $$;

-- Create indexes for user_progress if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_content_id ON user_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON user_progress(module_id) WHERE module_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id) WHERE lesson_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(completed) WHERE completed IS NOT NULL;

-- Add RLS policies for user_progress if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_progress' AND rowsecurity = true) THEN
        ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS policies for user_progress if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can view their own progress') THEN
        CREATE POLICY "Users can view their own progress" ON user_progress
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can insert their own progress') THEN
        CREATE POLICY "Users can insert their own progress" ON user_progress
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can update their own progress') THEN
        CREATE POLICY "Users can update their own progress" ON user_progress
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$; 