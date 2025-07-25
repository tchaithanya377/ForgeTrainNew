import { supabase } from './supabase'

export interface LogEntry {
  user_id: string
  action: string
  entity_type: string
  entity_id?: string
  metadata?: Record<string, any>
}

export class Logger {
  private static instance: Logger
  private queue: LogEntry[] = []
  private isProcessing = false

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  async log(entry: LogEntry): Promise<void> {
    this.queue.push(entry)
    
    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0 || this.isProcessing) return

    this.isProcessing = true

    try {
      const batch = this.queue.splice(0, 10) // Process in batches of 10
      
      const { error } = await supabase
        .from('system_logs')
        .insert(batch.map(entry => ({
          ...entry,
          created_at: new Date().toISOString()
        })))

      if (error) {
        console.error('Failed to log entries:', error)
        // Re-add failed entries to the front of the queue
        this.queue.unshift(...batch)
      }
    } catch (error) {
      console.error('Logging error:', error)
    } finally {
      this.isProcessing = false
      
      // Process remaining queue items
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000)
      }
    }
  }

  // Convenience methods for common log types
  async logUserAction(userId: string, action: string, entityType: string, entityId?: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata
    })
  }

  async logPageView(userId: string, page: string, metadata?: Record<string, any>): Promise<void> {
    await this.logUserAction(userId, 'page_view', 'page', undefined, {
      page,
      timestamp: new Date().toISOString(),
      ...metadata
    })
  }

  async logCourseEnrollment(userId: string, courseId: string, courseName: string): Promise<void> {
    await this.logUserAction(userId, 'course_enrolled', 'course', courseId, {
      course_name: courseName,
      enrollment_date: new Date().toISOString()
    })
  }

  async logLessonProgress(userId: string, lessonId: string, progress: number, timeSpent?: number): Promise<void> {
    await this.logUserAction(userId, 'lesson_progress', 'lesson', lessonId, {
      progress_percentage: progress,
      time_spent_minutes: timeSpent,
      completed: progress >= 100
    })
  }

  async logChallengeAttempt(userId: string, challengeId: string, success: boolean, language: string, timeSpent?: number): Promise<void> {
    await this.logUserAction(userId, 'challenge_attempt', 'challenge', challengeId, {
      success,
      programming_language: language,
      time_spent_minutes: timeSpent,
      attempt_date: new Date().toISOString()
    })
  }

  async logQuizCompletion(userId: string, quizId: string, score: number, timeSpent?: number): Promise<void> {
    await this.logUserAction(userId, 'quiz_completed', 'quiz', quizId, {
      score_percentage: score,
      time_spent_minutes: timeSpent,
      passed: score >= 70,
      completion_date: new Date().toISOString()
    })
  }

  async logSearch(userId: string, query: string, results: number, filters?: Record<string, any>): Promise<void> {
    await this.logUserAction(userId, 'search_performed', 'search', undefined, {
      search_query: query,
      results_count: results,
      filters,
      search_date: new Date().toISOString()
    })
  }

  async logError(userId: string, error: string, context?: Record<string, any>): Promise<void> {
    await this.logUserAction(userId, 'error_occurred', 'error', undefined, {
      error_message: error,
      context,
      error_date: new Date().toISOString()
    })
  }

  async logFeatureUsage(userId: string, feature: string, metadata?: Record<string, any>): Promise<void> {
    await this.logUserAction(userId, 'feature_used', 'feature', undefined, {
      feature_name: feature,
      usage_date: new Date().toISOString(),
      ...metadata
    })
  }
}

export const logger = Logger.getInstance()