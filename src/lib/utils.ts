import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
    case 'beginner':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'medium':
    case 'intermediate':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'hard':
    case 'advanced':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'expert':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-blue-500'
  if (percentage >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}