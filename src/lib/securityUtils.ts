import { supabase } from './supabase';

export interface SecurityEvent {
  type: 'tab_switch' | 'fullscreen_exit' | 'copy_paste' | 'dev_tools' | 'right_click' | 'keyboard_shortcut' | 'screenshot' | 'multiple_windows' | 'inspect_element' | 'console_access' | 'network_monitoring' | 'process_monitoring';
  timestamp: Date;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
  screenResolution?: string;
  windowSize?: string;
  mousePosition?: { x: number; y: number };
  keyboardEvents?: string[];
  networkActivity?: any;
}

export interface SecuritySession {
  id: string;
  user_id: string;
  quiz_id?: string;
  challenge_id?: string;
  session_type: 'quiz' | 'challenge';
  started_at: string;
  ended_at?: string;
  is_cheating_detected: boolean;
  violation_count: number;
  auto_submitted: boolean;
  security_level: string;
  metadata?: any;
}

export interface SecurityConfig {
  enableFullscreen: boolean;
  enableTabSwitchDetection: boolean;
  enableCopyPasteBlocking: boolean;
  enableRightClickBlocking: boolean;
  enableDevToolsBlocking: boolean;
  enableScreenshotDetection: boolean;
  enableMultipleWindowDetection: boolean;
  enableNetworkMonitoring: boolean;
  enableProcessMonitoring: boolean;
  enableMouseTracking: boolean;
  enableKeyboardTracking: boolean;
  enableScreenRecordingDetection: boolean;
  maxViolations: number;
  autoSubmitOnViolation: boolean;
  logToServer: boolean;
}

/**
 * Start a new security session for a quiz or challenge
 */
export async function startSecuritySession(
  sessionType: 'quiz' | 'challenge',
  quizId?: string,
  challengeId?: string,
  securityLevel: string = 'maximum'
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('start_security_session', {
      p_quiz_id: quizId || null,
      p_challenge_id: challengeId || null,
      p_session_type: sessionType,
      p_security_level: securityLevel
    });

    if (error) {
      console.error('Error starting security session:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error starting security session:', error);
    return null;
  }
}

/**
 * End a security session
 */
export async function endSecuritySession(
  sessionId: string,
  isCheatingDetected: boolean = false,
  violationCount: number = 0,
  autoSubmitted: boolean = false
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('end_security_session', {
      p_session_id: sessionId,
      p_is_cheating_detected: isCheatingDetected,
      p_violation_count: violationCount,
      p_auto_submitted: autoSubmitted
    });

    if (error) {
      console.error('Error ending security session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error ending security session:', error);
    return false;
  }
}

/**
 * Log a security event to the database
 */
export async function logSecurityEvent(
  sessionId: string,
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: string,
  metadata: any = {}
): Promise<string | null> {
  try {
    // First try to log using RPC function
    const { data, error } = await supabase.rpc('log_security_event', {
      p_session_id: sessionId,
      p_event_type: eventType,
      p_severity: severity,
      p_details: details,
      p_metadata: metadata
    });

    if (error) {
      console.warn('RPC logging failed, trying direct insert:', error);
      
      // Fallback to direct insert if RPC fails
      const { data: insertData, error: insertError } = await supabase
        .from('security_events')
        .insert({
          session_id: sessionId,
          event_type: eventType,
          severity: severity,
          details: details,
          metadata: metadata,
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          window_size: `${window.innerWidth}x${window.innerHeight}`
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error logging security event (direct insert):', insertError);
        return null;
      }

      return insertData?.id || null;
    }

    return data;
  } catch (error) {
    console.error('Error logging security event:', error);
    return null;
  }
}

/**
 * Get security summary for a user
 */
export async function getSecuritySummary(userId?: string): Promise<any | null> {
  try {
    const { data, error } = await supabase.rpc('get_security_summary', {
      p_user_id: userId || null
    });

    if (error) {
      console.error('Error getting security summary:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting security summary:', error);
    return null;
  }
}

/**
 * Update quiz attempt with security information
 */
export async function updateQuizAttemptSecurity(
  attemptId: string,
  securityEvents: SecurityEvent[],
  isCheatingDetected: boolean,
  violationCount: number,
  autoSubmitted: boolean,
  securitySessionId?: string
): Promise<boolean> {
  try {
    const updateData: any = {
      security_data: securityEvents,
      is_cheating_detected: isCheatingDetected,
      violation_count: violationCount,
      auto_submitted: autoSubmitted,
      updated_at: new Date().toISOString()
    };

    if (securitySessionId) {
      updateData.security_session_id = securitySessionId;
    }

    const { error } = await supabase
      .from('quiz_attempts')
      .update(updateData)
      .eq('id', attemptId);

    if (error) {
      console.error('Error updating quiz attempt security:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating quiz attempt security:', error);
    return false;
  }
}

/**
 * Update challenge attempt with security information
 */
export async function updateChallengeAttemptSecurity(
  attemptId: string,
  securityEvents: SecurityEvent[],
  isCheatingDetected: boolean,
  violationCount: number,
  autoSubmitted: boolean,
  securitySessionId?: string
): Promise<boolean> {
  try {
    const updateData: any = {
      security_events: securityEvents,
      is_cheating_detected: isCheatingDetected,
      violation_count: violationCount,
      auto_submitted: autoSubmitted,
      updated_at: new Date().toISOString()
    };

    if (securitySessionId) {
      updateData.security_session_id = securitySessionId;
    }

    const { error } = await supabase
      .from('challenge_attempts')
      .update(updateData)
      .eq('id', attemptId);

    if (error) {
      console.error('Error updating challenge attempt security:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating challenge attempt security:', error);
    return false;
  }
}

/**
 * Get security analytics for administrators
 */
export async function getSecurityAnalytics(
  filters: {
    startDate?: string;
    endDate?: string;
    sessionType?: 'quiz' | 'challenge';
    severity?: string;
  } = {}
): Promise<any[] | null> {
  try {
    let query = supabase
      .from('security_analytics')
      .select('*');

    if (filters.startDate) {
      query = query.gte('started_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('started_at', filters.endDate);
    }

    if (filters.sessionType) {
      query = query.eq('session_type', filters.sessionType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting security analytics:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting security analytics:', error);
    return null;
  }
}

/**
 * Get security events for a specific session
 */
export async function getSecurityEvents(sessionId: string): Promise<SecurityEvent[] | null> {
  try {
    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting security events:', error);
      return null;
    }

    return data.map(event => ({
      type: event.event_type as SecurityEvent['type'],
      timestamp: new Date(event.created_at),
      details: event.details,
      severity: event.severity as SecurityEvent['severity'],
      userAgent: event.user_agent,
      screenResolution: event.screen_resolution,
      windowSize: event.window_size,
      mousePosition: event.mouse_position,
      keyboardEvents: event.keyboard_events,
      networkActivity: event.network_activity
    }));
  } catch (error) {
    console.error('Error getting security events:', error);
    return null;
  }
}

/**
 * Get security sessions for a user
 */
export async function getUserSecuritySessions(userId?: string): Promise<SecuritySession[] | null> {
  try {
    const { data, error } = await supabase
      .from('security_sessions')
      .select('*')
      .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error getting user security sessions:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user security sessions:', error);
    return null;
  }
}

/**
 * Check if user has any security violations
 */
export async function hasSecurityViolations(userId?: string): Promise<boolean> {
  try {
    const summary = await getSecuritySummary(userId);
    if (!summary || summary.length === 0) return false;
    
    return summary[0].cheating_sessions > 0 || summary[0].total_violations > 0;
  } catch (error) {
    console.error('Error checking security violations:', error);
    return false;
  }
}

/**
 * Get default security configuration
 */
export function getDefaultSecurityConfig(): SecurityConfig {
  return {
    enableFullscreen: true,
    enableTabSwitchDetection: true,
    enableCopyPasteBlocking: true,
    enableRightClickBlocking: true,
    enableDevToolsBlocking: true,
    enableScreenshotDetection: true,
    enableMultipleWindowDetection: true,
    enableNetworkMonitoring: true,
    enableProcessMonitoring: true,
    enableMouseTracking: true,
    enableKeyboardTracking: true,
    enableScreenRecordingDetection: true,
    maxViolations: 3,
    autoSubmitOnViolation: true,
    logToServer: true
  };
}

/**
 * Validate security configuration
 */
export function validateSecurityConfig(config: Partial<SecurityConfig>): SecurityConfig {
  const defaultConfig = getDefaultSecurityConfig();
  return { ...defaultConfig, ...config };
}

/**
 * Create a security event object
 */
export function createSecurityEvent(
  type: SecurityEvent['type'],
  details: string,
  severity: SecurityEvent['severity'] = 'medium',
  metadata: any = {}
): SecurityEvent {
  return {
    type,
    timestamp: new Date(),
    details,
    severity,
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    ...metadata
  };
}

/**
 * Check if security features are supported in current browser
 */
export function checkSecuritySupport(): {
  fullscreen: boolean;
  copyPaste: boolean;
  devTools: boolean;
  networkMonitoring: boolean;
} {
  return {
    fullscreen: !!document.documentElement.requestFullscreen,
    copyPaste: !!navigator.clipboard,
    devTools: true, // Always supported for detection
    networkMonitoring: true // Always supported for detection
  };
} 