'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Floating particles component
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 6,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="particles">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState('')
  const router = useRouter()

  // Generate random room code
  const generateRoomCode = useCallback(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }, [])

  const showSuccessMessage = (message: string) => {
    setShowSuccess(message)
    setTimeout(() => setShowSuccess(''), 3000)
  }

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    const newRoomCode = generateRoomCode()
    
    // Show success message before navigation
    showSuccessMessage('Creating game...')
    
    // Small delay for better UX
    setTimeout(() => {
      router.push(`/game?room=${newRoomCode}&name=${encodeURIComponent(playerName)}&create=true`)
    }, 500)
  }

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }
    
    if (!roomCode.trim()) {
      setError('Please enter a room code')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    // Show success message before navigation
    showSuccessMessage('Joining game...')
    
    // Small delay for better UX
    setTimeout(() => {
      router.push(`/game?room=${roomCode.toUpperCase()}&name=${encodeURIComponent(playerName)}`)
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: 'create' | 'join') => {
    if (e.key === 'Enter') {
      if (action === 'create') {
        handleCreateGame()
      } else {
        handleJoinGame()
      }
    }
  }

  return (
    <>
      <FloatingParticles />
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20 dark:border-gray-700/20 animate-fade-in">
          <div className="text-center mb-8">
            <div className="animate-float mb-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent mb-2">
                Online XOX
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg animate-slide-up">
              Real-time multiplayer Tic Tac Toe
            </p>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Player Name Input */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'create')}
                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700/50 dark:text-gray-100 transition-all duration-300 backdrop-blur-sm hover:shadow-lg"
                placeholder="Enter your name"
                maxLength={20}
                suppressHydrationWarning
              />
            </div>

            {/* Create Game Button */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={handleCreateGame}
                disabled={isLoading}
                className={`w-full btn-primary ripple-effect ${isLoading ? 'btn-disabled' : ''}`}
                suppressHydrationWarning
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create New Game 🎮'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 backdrop-blur-sm rounded-full">
                  or
                </span>
              </div>
            </div>

            {/* Join Game Section */}
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Code
              </label>
              <input
                type="text"
                id="roomCode"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => handleKeyPress(e, 'join')}
                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700/50 dark:text-gray-100 transition-all duration-300 backdrop-blur-sm hover:shadow-lg"
                placeholder="Enter room code"
                maxLength={6}
                suppressHydrationWarning
              />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <button
                onClick={handleJoinGame}
                disabled={isLoading}
                className={`w-full btn-secondary ripple-effect ${isLoading ? 'btn-disabled' : ''}`}
                suppressHydrationWarning
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Joining...
                  </div>
                ) : (
                  'Join Game 🚀'
                )}
              </button>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm animate-scale-in">
                <div className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></span>
                  {showSuccess}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm animate-scale-in">
                <div className="flex items-center">
                  <span className="text-lg mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Game Rules */}
          <div className="mt-8 p-6 glass rounded-2xl animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              <span className="text-lg mr-2">📖</span>
              How to Play:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">•</span>
                Create a game and share the room code with a friend
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">•</span>
                Or join an existing game with a room code
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">•</span>
                First player is X, second player is O
              </li>
              <li className="flex items-center">
                <span className="text-red-500 mr-2">•</span>
                Get 3 in a row to win!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}