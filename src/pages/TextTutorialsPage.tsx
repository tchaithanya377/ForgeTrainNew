import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  ClockIcon,
  BookOpenIcon,
  AcademicCapIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
  ArrowRightIcon,
  TagIcon,
  CodeBracketIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLogger } from '../hooks/useLogger'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import toast from 'react-hot-toast'
import { getDifficultyColor } from '../lib/utils'
import type { TextTutorial } from '../lib/supabase'
import { seedTestTextTutorials } from '../utils/seedTestTextTutorials'

const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

export function TextTutorialsPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedDifficulty, setSelectedDifficulty] = React.useState('All')
  const [sortBy, setSortBy] = React.useState('newest')
  const { user } = useAuthStore()
  const { logSearch, logFeatureUsage } = useLogger()
  const navigate = useNavigate()

  // Fetch text tutorials from Supabase
  const { data: tutorials, isLoading, error, refetch } = useQuery({
    queryKey: ['published-text-tutorials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('text_tutorials')
        .select(`
          id,
          title,
          subtitle,
          learning_track,
          difficulty,
          time_minutes,
          summary,
          category,
          tags,
          programming_languages,
          learning_goals,
          what_students_learn,
          prerequisites,
          introduction,
          main_content,
          conclusion,
          fun_facts,
          is_published,
          created_by,
          created_at,
          updated_at
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching text tutorials:', error)
        throw error
      }

      return data as TextTutorial[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })

  // Filter and sort tutorials
  const filteredTutorials = React.useMemo(() => {
    if (!tutorials) return []

    let filtered = tutorials.filter(tutorial => {
      const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutorial.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutorial.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesDifficulty = selectedDifficulty === 'All' || 
                               tutorial.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()

      return matchesSearch && matchesDifficulty
    })

    // Sort tutorials
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
        filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
        break
      case 'duration':
        filtered.sort((a, b) => a.time_minutes - b.time_minutes)
        break
    }

    return filtered
  }, [tutorials, searchQuery, selectedDifficulty, sortBy])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    logSearch('text_tutorials', query)
  }

  const handleStartTutorial = (tutorial: TextTutorial) => {
    logFeatureUsage('start_text_tutorial', { tutorialId: tutorial.id, title: tutorial.title })
    navigate(`/tutorial/${tutorial.id}`)
  }

  const handleDifficultyFilter = (difficulty: string) => {
    setSelectedDifficulty(difficulty)
    logFeatureUsage('filter_text_tutorials_by_difficulty', { difficulty })
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    logFeatureUsage('sort_text_tutorials', { sortBy: sort })
  }

  const handleSeedData = async () => {
    try {
      await seedTestTextTutorials()
      toast.success('Test text tutorials seeded successfully!')
      refetch()
    } catch (error) {
      toast.error('Failed to seed test data')
      console.error('Error seeding test data:', error)
    }
  }

  const estimatedReadTime = (tutorial: TextTutorial) => {
    const totalLength = (tutorial.introduction?.length || 0) + 
                       (tutorial.main_content?.length || 0) + 
                       (tutorial.conclusion?.length || 0)
    return Math.ceil(totalLength / 1000) // Rough estimate: 1000 characters per minute
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Tutorials</h3>
            <p className="text-gray-600 mb-4">
              There was an error loading the text tutorials. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="primary">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#094d57] via-[#0c5a66] to-[#f1872c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                <BookOpenIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Text Tutorials</h1>
                <p className="text-white/80 text-xl mt-2">
                  Master programming concepts through comprehensive written guides
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5" />
                <span>{tutorials?.length || 0} tutorials available</span>
              </div>
              <div className="flex items-center space-x-2">
                <AcademicCapIcon className="h-5 w-5" />
                <span>Learn at your own pace</span>
              </div>
              <div className="flex items-center space-x-2">
                <LightBulbIcon className="h-5 w-5" />
                <span>Practical examples included</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search tutorials by title, content, or tags..."
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
                  variant={selectedDifficulty === difficulty ? 'primary' : 'secondary'}
                  onClick={() => handleDifficultyFilter(difficulty)}
                  className="whitespace-nowrap"
                >
                  {difficulty}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="difficulty">Difficulty</option>
                <option value="duration">Duration</option>
              </select>
            </div>

            {/* Seed Data Button (Development Only) */}
            <Button
              onClick={handleSeedData}
              variant="secondary"
              className="whitespace-nowrap"
            >
              Seed Test Data
            </Button>
          </div>
        </motion.div>

        {/* Tutorials Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTutorials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tutorials found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${getDifficultyColor(tutorial.difficulty)} border-0`}>
                        {tutorial.difficulty}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4" />
                        <span>{estimatedReadTime(tutorial)} min read</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight mb-2">
                      {tutorial.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {tutorial.subtitle}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {tutorial.summary}
                    </p>

                    {/* Tags */}
                    {tutorial.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <TagIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700">Topics</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tutorial.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {tutorial.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{tutorial.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Programming Languages */}
                    {tutorial.programming_languages.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CodeBracketIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700">Languages</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tutorial.programming_languages.slice(0, 2).map(lang => (
                            <Badge key={lang} variant="info" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                          {tutorial.programming_languages.length > 2 && (
                            <Badge variant="info" className="text-xs">
                              +{tutorial.programming_languages.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Learning Goals Preview */}
                    {tutorial.learning_goals && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <LightBulbIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700">You'll Learn</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {tutorial.learning_goals}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => handleStartTutorial(tutorial)}
                      variant="primary"
                      className="w-full"
                    >
                      <BookOpenIcon className="h-4 w-4 mr-2" />
                      Start Reading
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 