import React from 'react'
import { motion } from 'framer-motion'
import {
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'

interface ProgressItem {
  id: string
  title: string
  type: 'text_tutorial' | 'video_tutorial' | 'quiz' | 'code_challenge'
  completed: boolean
  score?: number
  estimatedDuration: number
  isRequired: boolean
}

interface ProgressSummaryProps {
  items: ProgressItem[]
  overallProgress: {
    percentage: number
    completed: number
    total: number
  }
  currentItemId?: string
}

export function ProgressSummary({ items, overallProgress, currentItemId }: ProgressSummaryProps) {
  const completedItems = items.filter(item => item.completed)
  const requiredItems = items.filter(item => item.isRequired)
  const completedRequired = requiredItems.filter(item => item.completed)

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrophyIcon className="h-5 w-5 text-yellow-500" />
            <span>Course Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Overall Completion</span>
                <span>{overallProgress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-[#094d57] to-[#f1872c] h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {overallProgress.completed} of {overallProgress.total} lessons completed
              </p>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedItems.length}</div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{items.length - completedItems.length}</div>
                <div className="text-sm text-blue-600">Remaining</div>
              </div>
            </div>

            {/* Required Items Progress */}
            {requiredItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Required Items</span>
                  <span>{completedRequired.length}/{requiredItems.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedRequired.length / requiredItems.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 