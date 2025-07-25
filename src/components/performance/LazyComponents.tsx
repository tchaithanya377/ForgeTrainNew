import React, { Suspense } from 'react'
import { motion } from 'framer-motion'

// Loading component with ForgeTrain branding
export const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-[#094d57] border-t-transparent rounded-full mx-auto mb-4"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center space-x-2"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-[#094d57] to-[#f1872c] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">FT</span>
        </div>
        <span className="text-lg font-semibold text-[#094d57]">ForgeTrain</span>
      </motion.div>
      <p className="text-gray-600 mt-2">{message}</p>
    </div>
  </div>
)

// Skeleton loading components
export const CourseCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
    <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="flex space-x-2">
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </div>
  </div>
)

export const DashboardSkeleton = () => (
  <div className="p-6 max-w-7xl mx-auto animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
)

export const CoursesSkeleton = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  </div>
)