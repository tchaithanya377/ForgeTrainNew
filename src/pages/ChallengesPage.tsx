import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  ClockIcon,
  CodeBracketIcon,
  PlayIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
  ArrowRightIcon,
  ViewColumnsIcon,
  Bars3Icon,
  TagIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { getDifficultyColor } from '../lib/utils'
import { ModernTechLoader } from '../components/ui/ModernTechLoader'
import toast from 'react-hot-toast'
import { seedTestChallenges } from '../utils/seedTestChallenges'

interface CodeChallenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category_id?: string
  tags: string[]
  company_tags: string[]
  supported_languages: string[]
  starter_code: Record<string, any>
  solution_code: Record<string, any>
  test_cases: any[]
  constraints: string
  hints: string[]
  time_complexity: string
  space_complexity: string
  acceptance_rate: number
  total_submissions: number
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
  step_by_step_solution?: string
}

const difficulties = ['All', 'Easy', 'Medium', 'Hard']
const sortOptions = [
  { value: 'newest', label: 'Newest', icon: FireIcon },
  { value: 'popular', label: 'Most Popular', icon: TrophyIcon },
  { value: 'acceptance', label: 'Acceptance Rate', icon: StarIcon },
  { value: 'difficulty', label: 'Difficulty', icon: ExclamationTriangleIcon },
]

export function ChallengesPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedDifficulty, setSelectedDifficulty] = React.useState('All')
  const [sortBy, setSortBy] = React.useState('newest')
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = React.useState('All')
  const { user } = useAuthStore()
  const { logSearch, logFeatureUsage } = useLogger()
  const navigate = useNavigate()

  // Fetch code challenges from Supabase
  const { 
    data: challenges, 
    isLoading, 
    error,
    isSuccess,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['published-code-challenges'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('code_challenges')
          .select(`
            id,
            title,
            description,
            difficulty,
            category_id,
            tags,
            company_tags,
            supported_languages,
            starter_code,
            solution_code,
            test_cases,
            constraints,
            hints,
            time_complexity,
            space_complexity,
            acceptance_rate,
            total_submissions,
            is_published,
            created_by,
            created_at,
            updated_at,
            step_by_step_solution
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Supabase query error:', error)
          throw error
        }

        return data || []
      } catch (err) {
        console.error('Failed to fetch published code challenges:', err)
        throw err
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })

  // Fetch challenge categories
  const { data: categories } = useQuery({
    queryKey: ['code-challenge-categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('code_challenge_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error) {
          console.error('Error fetching challenge categories:', error)
          return []
        }

        return data || []
      } catch (err) {
        console.error('Failed to fetch challenge categories:', err)
        return []
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  React.useEffect(() => {
    logFeatureUsage('challenges_page_view', {
      user_role: user?.role,
      search_query: searchQuery,
      difficulty_filter: selectedDifficulty,
      sort_by: sortBy,
      view_mode: viewMode
    })
  }, [logFeatureUsage, user?.role, searchQuery, selectedDifficulty, sortBy, viewMode])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    logSearch('challenges', query)
  }

  const handleChallengeClick = (challenge: CodeChallenge) => {
    logFeatureUsage('challenge_click', {
      challenge_id: challenge.id,
      challenge_title: challenge.title,
      difficulty: challenge.difficulty
    })
    // Navigate to challenge solving page
    navigate(`/challenge/${challenge.id}/solve`)
  }

  const handleSeedTestData = async () => {
    try {
      await seedTestChallenges()
      toast.success('Test challenges seeded successfully!')
      refetch()
    } catch (error) {
      toast.error('Failed to seed test challenges')
      console.error('Error seeding test data:', error)
    }
  }

  // Filter and sort challenges
  const filteredAndSortedChallenges = React.useMemo(() => {
    if (!challenges) return []

    let filtered = challenges.filter(challenge => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === 'All' || 
        challenge.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()

      // Category filter
      const matchesCategory = selectedCategory === 'All' || 
        challenge.category_id === selectedCategory

      return matchesSearch && matchesDifficulty && matchesCategory
    })

    // Sort challenges
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => (b.total_submissions || 0) - (a.total_submissions || 0))
        break
      case 'acceptance':
        filtered.sort((a, b) => (b.acceptance_rate || 0) - (a.acceptance_rate || 0))
        break
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
        filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
        break
    }

    return filtered
  }, [challenges, searchQuery, selectedDifficulty, selectedCategory, sortBy])

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
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Challenges</h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Failed to load challenges'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Coding Challenges
            </h1>
            <p className="text-gray-600 mt-2">
              Practice with real-world coding problems and improve your programming skills
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <ViewColumnsIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <Bars3Icon className="h-4 w-4" />
            </Button>
            {/* Development button - remove in production */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedTestData}
              className="text-xs"
            >
              Seed Test Data
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex gap-2">
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty(difficulty)}
              >
                {difficulty}
              </Button>
            ))}
          </div>

          {/* Category Filter */}
          {categories && categories.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'All' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('All')}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}

          {/* Sort */}
          <div className="flex gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400 mt-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#094d57] focus:border-[#094d57]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <p className="text-gray-600">
          {isRefetching ? 'Refreshing...' : `${filteredAndSortedChallenges.length} challenge${filteredAndSortedChallenges.length !== 1 ? 's' : ''} found`}
        </p>
      </motion.div>

      {/* Challenges Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {filteredAndSortedChallenges.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CodeBracketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Challenges Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedDifficulty !== 'All' || selectedCategory !== 'All'
                  ? 'Try adjusting your filters to see more challenges.'
                  : 'No challenges are available at the moment.'}
              </p>
              {(searchQuery || selectedDifficulty !== 'All' || selectedCategory !== 'All') && (
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedDifficulty('All')
                    setSelectedCategory('All')
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredAndSortedChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card 
                  className="h-full hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleChallengeClick(challenge)}
                >
                  <CardContent className="p-6">
                    {viewMode === 'grid' ? (
                      // Grid View
                      <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <TrophyIcon className="h-4 w-4" />
                            <span>{challenge.acceptance_rate || 0}%</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#094d57] transition-colors">
                          {challenge.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
                          {challenge.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {challenge.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" size="sm">
                              {tag}
                            </Badge>
                          ))}
                          {challenge.tags.length > 3 && (
                            <Badge variant="secondary" size="sm">
                              +{challenge.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Company Tags */}
                        {challenge.company_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {challenge.company_tags.slice(0, 2).map(company => (
                              <Badge key={company} variant="info" size="sm">
                                <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                                {company}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Languages */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {challenge.supported_languages.slice(0, 3).map(lang => (
                            <Badge key={lang} variant="outline" size="sm">
                              {lang}
                            </Badge>
                          ))}
                          {challenge.supported_languages.length > 3 && (
                            <Badge variant="outline" size="sm">
                              +{challenge.supported_languages.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FireIcon className="h-3 w-3" />
                              {(challenge.total_submissions / 1000).toFixed(1)}K
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {new Date(challenge.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="group-hover:bg-[#094d57] group-hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleChallengeClick(challenge)
                            }}
                          >
                            <CodeBracketIcon className="h-4 w-4 mr-1" />
                            Solve
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // List View
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={getDifficultyColor(challenge.difficulty)}>
                              {challenge.difficulty}
                            </Badge>
                            <h3 className="font-semibold text-gray-900 group-hover:text-[#094d57] transition-colors">
                              {challenge.title}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <TrophyIcon className="h-4 w-4" />
                              <span>{challenge.acceptance_rate || 0}% acceptance</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {challenge.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <TagIcon className="h-3 w-3" />
                              <span>{challenge.tags.slice(0, 3).join(', ')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FireIcon className="h-3 w-3" />
                              <span>{(challenge.total_submissions / 1000).toFixed(1)}K submissions</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              <span>{new Date(challenge.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="flex flex-wrap gap-1 mb-2">
                              {challenge.supported_languages.slice(0, 2).map(lang => (
                                <Badge key={lang} variant="outline" size="sm">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="group-hover:bg-[#094d57] group-hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleChallengeClick(challenge)
                            }}
                          >
                            <CodeBracketIcon className="h-4 w-4 mr-1" />
                            Solve
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
} 