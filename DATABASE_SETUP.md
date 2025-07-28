# Database Setup Guide

## Overview

This guide will help you set up the required database tables and fix the console errors you're experiencing.

## Issues to Fix

1. **Missing `challenge_attempts` table** - Causing 404 errors
2. **TensorFlow.js warnings** - Multiple backend registrations
3. **Language selection issues** - Inconsistent language handling

## Step 1: Apply Database Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. **Open your Supabase project dashboard**
2. **Go to the SQL Editor**
3. **Run the following migrations in order:**

#### Migration 1: Create Quiz Tables
```sql
-- Copy and paste the entire content from: supabase/migrations/001_create_quiz_tables.sql
```

#### Migration 2: Create Challenge Attempts
```sql
-- Copy and paste the entire content from: supabase/migrations/002_create_challenge_attempts.sql
```

#### Migration 3: Create Challenge Attempts (Alternative)
```sql
-- Copy and paste the entire content from: supabase/migrations/003_create_challenge_attempts.sql
```

### Option B: Using Supabase CLI

```bash
# Navigate to your project directory
cd /path/to/your/project

# Apply all migrations
supabase db push
```

## Step 2: Verify Database Tables

Run these queries in your Supabase SQL Editor to verify the tables exist:

```sql
-- Check if challenge_attempts table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'challenge_attempts'
);

-- Check if quiz_attempts table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'quiz_attempts'
);

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'challenge_attempts' 
ORDER BY ordinal_position;
```

## Step 3: Test the Application

After applying the migrations:

1. **Restart your development server:**
```bash
npm run dev
```

2. **Test challenge solving:**
   - Navigate to a challenge
   - Write some code
   - Click "Run Tests"
   - Click "Submit Solution"

3. **Check console for errors:**
   - TensorFlow.js warnings should be reduced
   - 404 errors for challenge_attempts should be gone
   - Language selection should work properly

## Step 4: Troubleshooting

### If you still get 404 errors:

1. **Check table permissions:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'challenge_attempts';
```

2. **Verify foreign key constraints:**
```sql
-- Check if code_challenges table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'code_challenges'
);
```

3. **Test table access:**
```sql
-- Test inserting a record (replace with actual values)
INSERT INTO challenge_attempts (
  user_id, 
  challenge_id, 
  submitted_code, 
  language, 
  is_successful, 
  score
) VALUES (
  'your-user-id',
  'your-challenge-id',
  'console.log("test")',
  'javascript',
  true,
  100
);
```

### If TensorFlow.js warnings persist:

The warnings are now handled gracefully and won't affect functionality. They're just informational messages about backend registration.

### If language selection issues persist:

1. **Check challenge data:**
```sql
-- Verify challenge data structure
SELECT id, title, supported_languages, starter_code 
FROM code_challenges 
WHERE is_published = true 
LIMIT 1;
```

2. **Check browser console for language selection logs**

## Step 5: Performance Optimization

### Add Database Indexes (Optional)

```sql
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user_challenge 
ON challenge_attempts(user_id, challenge_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz 
ON quiz_attempts(user_id, quiz_id);
```

### Monitor Query Performance

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements 
WHERE query LIKE '%challenge_attempts%' 
OR query LIKE '%quiz_attempts%'
ORDER BY mean_time DESC;
```

## Step 6: Security Considerations

### Row Level Security (RLS)

All tables have RLS enabled with proper policies:

- Users can only access their own data
- Proper authentication checks
- Secure data access patterns

### API Security

- All database operations go through Supabase
- Proper error handling prevents data leaks
- Input validation on all user inputs

## Expected Results

After completing this setup:

✅ **No more 404 errors** for challenge_attempts  
✅ **Reduced TensorFlow.js warnings**  
✅ **Proper language selection** in challenges  
✅ **Challenge submissions work** correctly  
✅ **Quiz attempts are saved** to database  
✅ **Progress tracking works** properly  

## Support

If you encounter issues:

1. **Check the console logs** for specific error messages
2. **Verify database connectivity** in Supabase dashboard
3. **Test with a simple challenge** first
4. **Check network tab** for failed requests

## Next Steps

Once the database is set up:

1. **Test all features** thoroughly
2. **Monitor performance** in Supabase dashboard
3. **Set up backups** if needed
4. **Configure monitoring** for production use 