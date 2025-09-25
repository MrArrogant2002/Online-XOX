import { memo, useCallback, useState } from 'react'

interface Player {
  name: string
  socketId: string
  connected: boolean
}

interface GameState {
  roomCode: string
  players: {
    X: Player | null
    O: Player | null
  }
  board: (string | null)[]
  currentPlayer: 'X' | 'O'
  gameStatus: 'waiting' | 'playing' | 'finished'
  winner: 'X' | 'O' | null
  winningLine: number[] | null
}

interface GameModalProps {
  gameState: GameState
  playerSymbol: 'X' | 'O' | null
  onPlayAgain: () => void
  onClose: () => void
}

const GameModal = memo(function GameModal({ gameState, playerSymbol, onPlayAgain, onClose }: GameModalProps) {
  const { winner, players } = gameState
  const [copySuccess, setCopySuccess] = useState(false)
  
  const isWinner = winner === playerSymbol
  const isDraw = !winner
  const winnerName = winner ? players[winner]?.name || winner : null

  const getResultMessage = useCallback(() => {
    if (isDraw) {
      return "It's a Draw!"
    }
    if (isWinner) {
      return "You Win! 🏆"
    }
    return `${winnerName} Wins!`
  }, [isDraw, isWinner, winnerName])

  const getResultColor = useCallback(() => {
    if (isDraw) return 'text-yellow-600 dark:text-yellow-400'
    if (isWinner) return 'text-green-600 dark:text-green-400'
    return 'text-red-600 dark:text-red-400'
  }, [isDraw, isWinner])

  const getResultEmoji = useCallback(() => {
    if (isDraw) return '🤝'
    if (isWinner) return '🎉'
    return '😔'
  }, [isDraw, isWinner])

  const getResultDescription = useCallback(() => {
    if (isDraw) {
      return "Great game! All squares filled with no winner."
    }
    if (isWinner) {
      return "Congratulations! You got three in a row!"
    }
    return "Better luck next time! Want to play again?"
  }, [isDraw, isWinner])

  const copyRoomCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(gameState.roomCode)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy room code:', err)
    }
  }, [gameState.roomCode])

  const getBackgroundGradient = useCallback(() => {
    if (isDraw) return 'from-yellow-500/20 to-orange-500/20'
    if (isWinner) return 'from-green-500/20 to-emerald-500/20'
    return 'from-red-500/20 to-pink-500/20'
  }, [isDraw, isWinner])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 scale-100 animate-scale-in border border-white/20 dark:border-gray-700/20`}>
        {/* Animated Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient()} rounded-3xl opacity-50`}></div>
        
        <div className="relative text-center">
          {/* Result Emoji with Enhanced Animation */}
          <div className="text-8xl mb-6 animate-bounce-slow">
            {getResultEmoji()}
          </div>

          {/* Confetti Effect for Winners */}
          {isWinner && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
              <div className="animate-ping absolute top-0 left-0 w-4 h-4 bg-yellow-400 rounded-full opacity-75"></div>
              <div className="animate-ping absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full opacity-75" style={{ animationDelay: '0.2s' }}></div>
              <div className="animate-ping absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full opacity-75" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}

          {/* Result Message */}
          <h2 className={`text-4xl font-bold mb-6 ${getResultColor()} animate-slide-up`}>
            {getResultMessage()}
          </h2>

          {/* Result Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {getResultDescription()}
          </p>

          {/* Enhanced Game Statistics */}
          <div className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-md rounded-2xl p-6 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center justify-center">
              <span className="text-2xl mr-2">📊</span>
              Game Summary
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="relative mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg">
                    X
                  </div>
                  {winner === 'X' && (
                    <div className="absolute -top-1 -right-1 text-2xl animate-bounce">👑</div>
                  )}
                </div>
                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {players.X?.name || 'Player X'}
                </div>
                {winner === 'X' && (
                  <div className="text-green-600 dark:text-green-400 font-bold text-sm animate-pulse">
                    Winner! 🎉
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="relative mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg">
                    O
                  </div>
                  {winner === 'O' && (
                    <div className="absolute -top-1 -right-1 text-2xl animate-bounce">👑</div>
                  )}
                </div>
                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {players.O?.name || 'Player O'}
                </div>
                {winner === 'O' && (
                  <div className="text-green-600 dark:text-green-400 font-bold text-sm animate-pulse">
                    Winner! 🎉
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={onPlayAgain}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-600 ripple-effect"
            >
              🔄 Play Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 ripple-effect"
            >
              ✖️ Close
            </button>
          </div>

          {/* Enhanced Room Code Sharing */}
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={copyRoomCode}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              <span className="text-lg">📋</span>
              <span className="font-medium">
                {copySuccess ? 'Copied!' : `Copy Room Code: ${gameState.roomCode}`}
              </span>
              {copySuccess && <span className="text-green-500">✓</span>}
            </button>
          </div>

          {/* Share Options */}
          <div className="mt-4 text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Share with friends:</p>
            <div className="flex justify-center space-x-2">
              <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                📱
              </button>
              <button className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                💬
              </button>
              <button className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                📧
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default GameModal