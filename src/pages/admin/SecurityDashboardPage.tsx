import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import {
  getSecurityAnalytics,
  getSecuritySummary,
  getUserSecuritySessions,
  SecurityEvent,
  SecuritySession
} from '../../lib/securityUtils';

interface SecurityStats {
  totalSessions: number;
  cheatingSessions: number;
  totalViolations: number;
  criticalViolations: number;
  autoSubmissions: number;
  avgSessionDuration: number;
}

interface SecurityTrend {
  date: string;
  sessions: number;
  violations: number;
  cheatingDetected: number;
}

export function SecurityDashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedSessionType, setSelectedSessionType] = useState<'all' | 'quiz' | 'challenge'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  // Fetch security analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['security-analytics', selectedTimeRange, selectedSessionType],
    queryFn: async () => {
      const endDate = new Date().toISOString();
      const startDate = new Date();
      
      switch (selectedTimeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      const filters: any = {
        startDate: startDate.toISOString(),
        endDate
      };

      if (selectedSessionType !== 'all') {
        filters.sessionType = selectedSessionType;
      }

      return await getSecurityAnalytics(filters);
    }
  });

  // Fetch security summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['security-summary'],
    queryFn: async () => {
      return await getSecuritySummary();
    }
  });

  // Fetch recent security sessions
  const { data: recentSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['recent-security-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_sessions')
        .select(`
          *,
          users!inner(email, full_name),
          quizzes(title),
          code_challenges(title)
        `)
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });

  // Fetch recent security events
  const { data: recentEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['recent-security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select(`
          *,
          users!inner(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return DocumentTextIcon;
      case 'challenge': return CodeBracketIcon;
      default: return EyeIcon;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (analyticsLoading || summaryLoading || sessionsLoading || eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094d57] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Dashboard</h1>
          <p className="text-gray-600">Monitor and manage anti-cheating system</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Time Range:</span>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Session Type:</span>
            <select
              value={selectedSessionType}
              onChange={(e) => setSelectedSessionType(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Types</option>
              <option value="quiz">Quizzes</option>
              <option value="challenge">Challenges</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <EyeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {selectedTimeRange === '7d' ? 'Last 7 days' : selectedTimeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cheating Detected</CardTitle>
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {analytics?.filter(a => a.is_cheating_detected).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.length ? Math.round((analytics.filter(a => a.is_cheating_detected).length / analytics.length) * 100) : 0}% of sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
              <ShieldCheckIcon className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {analytics?.reduce((sum, a) => sum + (a.total_events || 0), 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto Submissions</CardTitle>
              <LockClosedIcon className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {analytics?.filter(a => a.auto_submitted).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Due to violations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Security Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                Recent Security Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions?.map((session) => {
                  const SessionIcon = getSessionTypeIcon(session.session_type);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <SessionIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {session.users?.full_name || session.users?.email}
                          </p>
                          <p className="text-xs text-gray-600">
                            {session.session_type} • {formatDate(session.started_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.is_cheating_detected ? (
                          <Badge className="bg-red-100 text-red-800 border-red-300">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Cheating
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Clean
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {session.violation_count} violations
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents?.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{event.details}</p>
                        <p className="text-xs text-gray-600">
                          {event.users?.full_name || event.users?.email} • {formatDate(event.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Analytics Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" />
              Security Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Session Type</th>
                    <th className="text-left py-2">Started</th>
                    <th className="text-left py-2">Duration</th>
                    <th className="text-left py-2">Violations</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.map((session) => (
                    <tr key={session.session_id} className="border-b hover:bg-gray-50">
                      <td className="py-2">
                        <div>
                          <p className="font-medium">{session.email}</p>
                          <p className="text-xs text-gray-600">ID: {session.user_id}</p>
                        </div>
                      </td>
                      <td className="py-2">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                          {session.session_type}
                        </Badge>
                      </td>
                      <td className="py-2 text-gray-600">
                        {formatDate(session.started_at)}
                      </td>
                      <td className="py-2 text-gray-600">
                        {session.session_duration_seconds ? formatDuration(session.session_duration_seconds) : 'N/A'}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{session.total_events || 0}</span>
                          {session.critical_violations > 0 && (
                            <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
                              {session.critical_violations} Critical
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2">
                        {session.is_cheating_detected ? (
                          <Badge className="bg-red-100 text-red-800 border-red-300">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Cheating Detected
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Clean
                          </Badge>
                        )}
                      </td>
                      <td className="py-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 