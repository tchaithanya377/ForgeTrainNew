import React from 'react'
import { FixedSizeList as List, VariableSizeList } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { 
  ClockIcon, 
  StarIcon, 
  CodeBracketIcon,
  PlayIcon,
  TrophyIcon 
} from '@heroicons/react/24/outline'
import { formatDuration, getDifficultyColor } from '../../lib/utils'

// Types
interface Course {
  id: string
  title: string
  description: string
  difficulty: string
  duration: number
  rating: number
  students: number
  thumbnail: string
  tags: string[]
  instructor: string
}

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: string
  acceptance_rate: number
  total_submissions: number
  tags: string[]
  company_tags: string[]
}

interface Quiz {
  id: string
  title: string
  description: string
  difficulty: string
  time_limit_minutes: number
  passing_score: number
  questions_count: number
}

// Course List Virtualization
interface CourseItemProps {
  index: number
  style: React.CSSProperties
  data: Course[]
}

const CourseItem: React.FC<CourseItemProps> = ({ index, style, data }) => {
  const course = data[index]
  
  return (
    <div style={style} className="px-4 py-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card hover className="h-full">
          <CardContent className="p-0">
            <div className="flex">
              {/* Course Thumbnail */}
              <div className="w-48 h-32 bg-gray-200 rounded-l-xl overflow-hidden flex-shrink-0">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Course Content */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{course.rating}</span>
                        <span>({course.students})</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {course.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <p className="text-sm text-gray-500 mb-3">
                      by {course.instructor}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{formatDuration(course.duration)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Button variant="primary" size="sm">
                      Enroll Now
                    </Button>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {course.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {course.tags.length > 3 && (
                    <Badge variant="default" size="sm">
                      +{course.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export const VirtualizedCourseList: React.FC<{
  courses: Course[]
  height: number
}> = ({ courses, height }) => {
  return (
    <List
      height={height}
      itemCount={courses.length}
      itemSize={160} // Height of each course item
      itemData={courses}
      overscanCount={3} // Render 3 extra items for smooth scrolling
    >
      {CourseItem}
    </List>
  )
}

// Challenge List Virtualization
interface ChallengeItemProps {
  index: number
  style: React.CSSProperties
  data: Challenge[]
}

const ChallengeItem: React.FC<ChallengeItemProps> = ({ index, style, data }) => {
  const challenge = data[index]
  
  return (
    <div style={style} className="px-4 py-2">
      <Card hover>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <TrophyIcon className="h-4 w-4" />
                  <span>{challenge.acceptance_rate}% acceptance</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">
                {challenge.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {challenge.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {challenge.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {challenge.company_tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {challenge.company_tags.slice(0, 2).map(company => (
                    <Badge key={company} variant="info" size="sm">
                      {company}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="ml-4">
              <Button variant="outline" size="sm">
                <CodeBracketIcon className="h-4 w-4 mr-1" />
                Solve
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const VirtualizedChallengeList: React.FC<{
  challenges: Challenge[]
  height: number
}> = ({ challenges, height }) => {
  return (
    <List
      height={height}
      itemCount={challenges.length}
      itemSize={180}
      itemData={challenges}
      overscanCount={5}
    >
      {ChallengeItem}
    </List>
  )
}

// Variable Size List for Mixed Content
interface MixedContentItem {
  type: 'course' | 'challenge' | 'quiz'
  data: Course | Challenge | Quiz
}

const getItemSize = (index: number, items: MixedContentItem[]) => {
  const item = items[index]
  switch (item.type) {
    case 'course': return 160
    case 'challenge': return 180
    case 'quiz': return 120
    default: return 140
  }
}

export const VirtualizedMixedList: React.FC<{
  items: MixedContentItem[]
  height: number
}> = ({ items, height }) => {
  return (
    <VariableSizeList
      height={height}
      itemCount={items.length}
      itemSize={(index) => getItemSize(index, items)}
      itemData={items}
      overscanCount={3}
    >
      {({ index, style, data }) => {
        const item = data[index]
        
        return (
          <div style={style} className="px-4 py-2">
            {item.type === 'course' && <CourseItem index={index} style={{}} data={[item.data as Course]} />}
            {item.type === 'challenge' && <ChallengeItem index={index} style={{}} data={[item.data as Challenge]} />}
            {item.type === 'quiz' && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{(item.data as Quiz).title}</h3>
                      <p className="text-sm text-gray-600">{(item.data as Quiz).description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Start Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )
      }}
    </VariableSizeList>
  )
}

// Infinite Loading Implementation
export const InfiniteVirtualChallengeList: React.FC = () => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteChallenges()
  
  const items = data?.pages.flatMap(page => page) ?? []
  const itemCount = hasNextPage ? items.length + 1 : items.length
  
  const isItemLoaded = (index: number) => !!items[index]
  
  const loadMoreItems = isFetchingNextPage ? () => {} : fetchNextPage
  
  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
      threshold={5} // Start loading when 5 items from the end
    >
      {({ onItemsRendered, ref }) => (
        <List
          ref={ref}
          height={600}
          itemCount={itemCount}
          itemSize={180}
          onItemsRendered={onItemsRendered}
          overscanCount={5}
        >
          {({ index, style }) => (
            <div style={style} className="px-4 py-2">
              {items[index] ? (
                <ChallengeItem 
                  index={index} 
                  style={{}} 
                  data={[items[index]]} 
                />
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </List>
      )}
    </InfiniteLoader>
  )
}

// Performance monitoring hook
export const useVirtualListPerformance = () => {
  const [renderCount, setRenderCount] = React.useState(0)
  const [lastRenderTime, setLastRenderTime] = React.useState(0)
  
  React.useEffect(() => {
    const start = performance.now()
    setRenderCount(prev => prev + 1)
    
    const end = performance.now()
    setLastRenderTime(end - start)
  })
  
  return { renderCount, lastRenderTime }
}