import { memo } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const LoadingSpinner = memo(function LoadingSpinner({ size = 'md', message = 'Loading...' }: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6'
      case 'lg':
        return 'w-16 h-16'
      default:
        return 'w-10 h-10'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'lg':
        return 'text-xl'
      default:
        return 'text-base'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
      {/* Enhanced Spinner with Gradient */}
      <div className={`${getSizeClasses()} relative`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-spin">
          <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900"></div>
        </div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin" style={{ animationDirection: 'reverse' }}>
          <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900"></div>
        </div>
      </div>
      
      {/* Loading Message with Animation */}
      <p className={`mt-6 font-medium text-gray-600 dark:text-gray-400 ${getTextSize()} animate-pulse`}>
        {message}
      </p>
      
      {/* Enhanced Pulsing Dots */}
      <div className="flex space-x-2 mt-4">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>

      {/* Connection Status Indicator */}
      <div className="mt-6 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Establishing connection...</span>
      </div>
    </div>
  )
})

export default LoadingSpinner