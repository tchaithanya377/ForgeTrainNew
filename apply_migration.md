# How to Apply the Database Migration

## Option 1: Using Supabase Dashboard (Recommended)

1. **Open your Supabase project dashboard**
2. **Go to the SQL Editor**
3. **Copy and paste the entire content from `supabase/migrations/001_create_quiz_tables.sql`**
4. **Click "Run" to execute the migration**

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Apply the migration
supabase db push
```

## Option 3: Manual SQL Execution

You can also run the SQL commands manually in your Supabase SQL Editor:

### Step 1: Create quiz_attempts table
```sql
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
```

### Step 2: Create indexes
```sql
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at DESC);
```

### Step 3: Enable RLS and create policies
```sql
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz attempts" ON quiz_attempts
  FOR UPDATE USING (auth.uid() = user_id);
```

### Step 4: Add columns to existing user_progress table
```sql
-- Add completed column if it doesn't exist
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

-- Add score column if it doesn't exist
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score >= 0 AND score <= 100);

-- Add completed_at column if it doesn't exist
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add lesson_type column if it doesn't exist
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS lesson_type TEXT CHECK (lesson_type IN ('text_tutorial', 'video_tutorial', 'quiz', 'code_challenge'));

-- Add module_id column if it doesn't exist
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id);

-- Add lesson_id column if it doesn't exist
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS lesson_id UUID;
```

## Verification

After applying the migration, you can verify it worked by:

1. **Check if the quiz_attempts table exists:**
```sql
SELECT * FROM quiz_attempts LIMIT 0;
```

2. **Check if the new columns were added to user_progress:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_progress' 
AND column_name IN ('completed', 'score', 'completed_at', 'lesson_type', 'module_id', 'lesson_id');
```

3. **Check if RLS policies are in place:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'quiz_attempts';
```

## Troubleshooting

### If you get foreign key constraint errors:
Make sure the `quizzes` table exists and has the correct structure.

### If you get permission errors:
Make sure you're running the migration as a database owner or have the necessary privileges.

### If columns already exist:
The migration uses `IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`, so it should handle existing columns gracefully.

## Next Steps

After applying the migration:

1. **Test the quiz functionality** by taking a quiz and scoring 70% or higher
2. **Verify that quiz completion is saved** to the database
3. **Check that the UI updates** to show the quiz as completed
4. **Verify that camera/microphone are properly released** after quiz completion

The migration is designed to be safe and non-destructive, so it can be run multiple times without issues. 