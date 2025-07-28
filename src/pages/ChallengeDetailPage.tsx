import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { CodingChallengeComponent } from '../components/course/CodingChallengeComponent'
import { Button } from '../components/ui/Button'
import { ModernTechLoader } from '../components/ui/ModernTechLoader'
import { Card, CardContent } from '../components/ui/Card'

export function ChallengeDetailPage() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { logFeatureUsage } = useLogger()

  // Fetch challenge data
  const { data: challenge, isLoading, error } = useQuery({
    queryKey: ['code-challenge', challengeId],
    queryFn: async () => {
      if (!challengeId) throw new Error('Challenge ID is required')

      const { data, error } = await supabase
        .from('code_challenges')
        .select('*')
        .eq('id', challengeId)
        .eq('is_published', true)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!challengeId,
  })

  React.useEffect(() => {
    if (challenge) {
      logFeatureUsage('challenge_detail_view', {
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        difficulty: challenge.difficulty
      })
    }
  }, [challenge, logFeatureUsage])

  const handleBack = () => {
    navigate('/challenges')
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ModernTechLoader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Challenge</h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Failed to load challenge'}
            </p>
            <Button onClick={handleBack} variant="outline">
              Back to Challenges
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Challenge Not Found</h3>
            <p className="text-gray-600 mb-4">
              The challenge you're looking for doesn't exist or is not published.
            </p>
            <Button onClick={handleBack} variant="outline">
              Back to Challenges
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Challenges
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Challenge Content */}
      <CodingChallengeComponent challenge={challenge} />
    </div>
  )
} 