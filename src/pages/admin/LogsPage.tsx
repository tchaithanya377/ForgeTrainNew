import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { formatDistanceToNow } from 'date-fns'

interface SystemLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id?: string
  metadata?: Record<string, any>
  created_at: string
  users?: {
    full_name: string
    email: string
  }
}

const actionIcons = {
  page_view: DocumentTextIcon,
  course_enrolled: CheckCircleIcon,
  lesson_progress: InformationCircleIcon,
  challenge_attempt: DocumentTextIcon,
  quiz_completed: CheckCircleIcon,
  search_performed: MagnifyingGlassIcon,
  error_occurred: ExclamationTriangleIcon,
  feature_used: InformationCircleIcon,
  user_created: UserIcon,
  user_updated: UserIcon,
}

const actionColors = {
  page_view: 'info',
  course_enrolled: 'success',
  lesson_progress: 'info',
  challenge_attempt: 'warning',
  quiz_completed: 'success',
  search_performed: 'info',
  error_occurred: 'danger',
  feature_used: 'info',
  user_created: 'success',
  user_updated: 'warning',
} as const

export function LogsPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedAction, setSelectedAction] = React.useState('all')
  const [selectedEntityType, setSelectedEntityType] = React.useState('all')
  const [dateRange, setDateRange] = React.useState('today')
  const [page, setPage] = React.useState(1)
  const pageSize = 50

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['system-logs', searchQuery, selectedAction, selectedEntityType, dateRange, page],
    queryFn: async () => {
      let query = supabase
        .from('system_logs')
        .select(`
          *,
          users (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      // Apply filters
      if (selectedAction !== 'all') {
        query = query.eq('action', selectedAction)
      }

      if (selectedEntityType !== 'all') {
        query = query.eq('entity_type', selectedEntityType)
      }

      if (dateRange !== 'all') {
        const now = new Date()
        let startDate: Date

        switch (dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          default:
            startDate = new Date(0)
        }

        query = query.gte('created_at', startDate.toISOString())
      }

      if (searchQuery) {
        query = query.or(`action.ilike.%${searchQuery}%,entity_type.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data as SystemLog[]
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['log-stats', dateRange],
    queryFn: async () => {
      const now = new Date()
      let startDate: Date

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          startDate = new Date(0)
      }

      const { data, error } = await supabase
        .from('system_logs')
        .select('action, entity_type')
        .gte('created_at', startDate.toISOString())

      if (error) throw error

      const actionCounts = data.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const entityCounts = data.reduce((acc, log) => {
        acc[log.entity_type] = (acc[log.entity_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        total: data.length,
        actionCounts,
        entityCounts,
        topActions: Object.entries(actionCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5),
        topEntities: Object.entries(entityCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5),
      }
    },
  })

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action as keyof typeof actionIcons] || DocumentTextIcon
    return Icon
  }

  const getActionColor = (action: string) => {
    return actionColors[action as keyof typeof actionColors] || 'info'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Logs</h1>
        <p className="text-gray-600">
          Monitor user activities and system events across the platform
        </p>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Action</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.topActions[0]?.[0] || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats.topActions[0]?.[1] || 0} events
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Entity</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.topEntities[0]?.[0] || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats.topEntities[0]?.[1] || 0} events
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <UserIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.actionCounts.error_occurred ? 
                      ((stats.actionCounts.error_occurred / stats.total) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<MagnifyingGlassIcon />}
              />

              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#094d57] focus:border-transparent"
              >
                <option value="all">All Actions</option>
                <option value="page_view">Page Views</option>
                <option value="course_enrolled">Course Enrollments</option>
                <option value="lesson_progress">Lesson Progress</option>
                <option value="challenge_attempt">Challenge Attempts</option>
                <option value="quiz_completed">Quiz Completions</option>
                <option value="search_performed">Searches</option>
                <option value="error_occurred">Errors</option>
                <option value="feature_used">Feature Usage</option>
              </select>

              <select
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#094d57] focus:border-transparent"
              >
                <option value="all">All Entities</option>
                <option value="page">Pages</option>
                <option value="course">Courses</option>
                <option value="lesson">Lessons</option>
                <option value="challenge">Challenges</option>
                <option value="quiz">Quizzes</option>
                <option value="user">Users</option>
                <option value="search">Searches</option>
                <option value="error">Errors</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#094d57] focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedAction('all')
                  setSelectedEntityType('all')
                  setDateRange('today')
                  setPage(1)
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#094d57]"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Failed to load logs</p>
              </div>
            ) : logs && logs.length > 0 ? (
              <div className="space-y-4">
                {logs.map((log, index) => {
                  const Icon = getActionIcon(log.action)
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 bg-white rounded-lg">
                        <Icon className="h-5 w-5 text-[#094d57]" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getActionColor(log.action)}>
                            {log.action.replace('_', ' ')}
                          </Badge>
                          <Badge variant="default">
                            {log.entity_type}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {log.users?.full_name || 'Unknown User'}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({log.users?.email || log.user_id})
                          </span>
                        </div>

                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                              View metadata
                            </summary>
                            <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </motion.div>
                  )
                })}

                {/* Pagination */}
                <div className="flex items-center justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={!logs || logs.length < pageSize}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No logs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}