import React from 'react'
import { cn } from '../../lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function Progress({ 
  value, 
  max = 100, 
  className,
  variant = 'default',
  size = 'md',
  showLabel = false
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const baseClasses = "w-full bg-gray-200 rounded-full overflow-hidden"
  
  const sizeClasses = {
    sm: "h-1",
    md: "h-2", 
    lg: "h-3"
  }

  const variantClasses = {
    default: "bg-[#094d57]",
    success: "bg-green-500",
    warning: "bg-yellow-500", 
    error: "bg-red-500"
  }

  return (
    <div className={cn(baseClasses, sizeClasses[size], className)}>
      <div
        className={cn(
          "h-full transition-all duration-300 ease-out",
          variantClasses[variant]
        )}
        style={{ width: `${percentage}%` }}
      />
      {showLabel && (
        <div className="text-xs text-gray-600 mt-1 text-center">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
} 