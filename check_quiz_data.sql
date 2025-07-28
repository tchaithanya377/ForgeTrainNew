-- Check if there are any quizzes in the database
SELECT id, title, description, passing_score, is_published 
FROM quizzes 
LIMIT 10;

-- Check if there are any quiz questions
SELECT quiz_id, COUNT(*) as question_count 
FROM quiz_questions 
GROUP BY quiz_id;

-- Check if there are any quiz attempts
SELECT quiz_id, user_id, score, passed, completed_at 
FROM quiz_attempts 
ORDER BY completed_at DESC 
LIMIT 10;

-- Check user progress for quizzes
SELECT user_id, content_type, content_id, completed, score, completed_at 
FROM user_progress 
WHERE content_type = 'quiz' 
ORDER BY completed_at DESC 
LIMIT 10;

-- Check specific quiz questions for a quiz (replace 'quiz_id_here' with actual quiz ID)
-- SELECT * FROM quiz_questions WHERE quiz_id = 'quiz_id_here';

-- Check if the quiz_attempts table exists and has the right structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
ORDER BY ordinal_position; 