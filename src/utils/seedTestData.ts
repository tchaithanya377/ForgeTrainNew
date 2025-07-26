import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export async function seedTestData() {
  const { user } = useAuthStore.getState()
  
  if (!user?.id) {
    console.error('No user found for seeding test data')
    return
  }

  try {
    // Update student profile with some test data
    const { error: updateError } = await supabase
      .from('students')
      .update({
        total_study_hours: 25.5,
        challenges_solved: 8,
        quizzes_passed: 12,
        total_points: 850,
        current_streak_days: 7,
        courses_completed: 3,
        average_quiz_score: 87,
        daily_study_goal_minutes: 60,
        last_active_date: new Date().toISOString().split('T')[0]
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating student data:', updateError)
    }

    // Create some sample progress entries
    const sampleProgress = [
      {
        user_id: user.id,
        content_id: 'sample-quiz-1',
        content_type: 'quiz',
        progress_percentage: 100,
        score: 95,
        completed: true,
        completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: user.id,
        content_id: 'sample-tutorial-1',
        content_type: 'text_tutorial',
        progress_percentage: 75,
        score: 75,
        completed: false,
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      },
      {
        user_id: user.id,
        content_id: 'sample-challenge-1',
        content_type: 'code_challenge',
        progress_percentage: 100,
        score: 88,
        completed: true,
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    for (const progress of sampleProgress) {
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert(progress)

      if (progressError) {
        console.error('Error creating progress entry:', progressError)
      }
    }

    // Create sample content for the progress entries
    const sampleContent = [
      {
        id: 'sample-quiz-1',
        title: 'JavaScript Fundamentals Quiz',
        description: 'Test your knowledge of JavaScript basics',
        difficulty: 'beginner',
        time_limit_minutes: 30,
        passing_score: 70,
        tags: ['javascript', 'beginner'],
        is_published: true,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'sample-tutorial-1',
        title: 'React Hooks Deep Dive',
        subtitle: 'Master useState and useEffect',
        learning_track: 'React Development',
        difficulty: 'intermediate',
        time_minutes: 45,
        summary: 'Learn advanced React hooks patterns',
        category: 'Frontend',
        tags: ['react', 'hooks', 'intermediate'],
        is_published: true,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'sample-challenge-1',
        title: 'Array Manipulation Challenge',
        description: 'Practice array methods and algorithms',
        difficulty: 'beginner',
        time_limit_minutes: 20,
        passing_score: 80,
        tags: ['arrays', 'algorithms', 'beginner'],
        is_published: true,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    // Insert sample quizzes
    for (const content of sampleContent) {
      if (content.id === 'sample-quiz-1') {
        const { error: quizError } = await supabase
          .from('quizzes')
          .upsert(content)
        if (quizError) console.error('Error creating quiz:', quizError)
      } else if (content.id === 'sample-tutorial-1') {
        const { error: tutorialError } = await supabase
          .from('text_tutorials')
          .upsert(content)
        if (tutorialError) console.error('Error creating tutorial:', tutorialError)
      } else if (content.id === 'sample-challenge-1') {
        const { error: challengeError } = await supabase
          .from('code_challenges')
          .upsert(content)
        if (challengeError) console.error('Error creating challenge:', challengeError)
      }
    }

    console.log('Test data seeded successfully!')
    return true
  } catch (error) {
    console.error('Error seeding test data:', error)
    return false
  }
}

export async function clearTestData() {
  const { user } = useAuthStore.getState()
  
  if (!user?.id) {
    console.error('No user found for clearing test data')
    return
  }

  try {
    // Clear progress entries
    const { error: progressError } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', user.id)
      .in('content_id', ['sample-quiz-1', 'sample-tutorial-1', 'sample-challenge-1'])

    if (progressError) {
      console.error('Error clearing progress:', progressError)
    }

    // Clear sample content
    const { error: quizError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', 'sample-quiz-1')

    const { error: tutorialError } = await supabase
      .from('text_tutorials')
      .delete()
      .eq('id', 'sample-tutorial-1')

    const { error: challengeError } = await supabase
      .from('code_challenges')
      .delete()
      .eq('id', 'sample-challenge-1')

    if (quizError) console.error('Error clearing quiz:', quizError)
    if (tutorialError) console.error('Error clearing tutorial:', tutorialError)
    if (challengeError) console.error('Error clearing challenge:', challengeError)

    // Reset student data
    const { error: resetError } = await supabase
      .from('students')
      .update({
        total_study_hours: 0,
        challenges_solved: 0,
        quizzes_passed: 0,
        total_points: 0,
        current_streak_days: 0,
        courses_completed: 0,
        average_quiz_score: 0
      })
      .eq('user_id', user.id)

    if (resetError) {
      console.error('Error resetting student data:', resetError)
    }

    console.log('Test data cleared successfully!')
    return true
  } catch (error) {
    console.error('Error clearing test data:', error)
    return false
  }
} 