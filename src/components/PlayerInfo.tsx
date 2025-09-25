import { memo, useCallback } from 'react'

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

interface PlayerInfoProps {
  gameState: GameState
  playerSymbol: 'X' | 'O' | null
}

const PlayerInfo = memo(function PlayerInfo({ gameState, playerSymbol }: PlayerInfoProps) {
  const { players, currentPlayer, gameStatus } = gameState

  const getPlayerStatus = useCallback((symbol: 'X' | 'O') => {
    const player = players[symbol]
    
    if (!player) return 'Waiting...'
    if (!player.connected) return 'Disconnected'
    if (gameStatus === 'playing' && currentPlayer === symbol) return 'Turn'
    return 'Ready'
  }, [players, gameStatus, currentPlayer])

  const getPlayerStatusColor = useCallback((symbol: 'X' | 'O') => {
    const player = players[symbol]
    
    if (!player) return 'text-gray-500'
    if (!player.connected) return 'text-red-500'
    if (gameStatus === 'playing' && currentPlayer === symbol) return 'text-green-500'
    return 'text-blue-500'
  }, [players, gameStatus, currentPlayer])

  const isCurrentPlayer = useCallback((symbol: 'X' | 'O') => {
    return symbol === playerSymbol
  }, [playerSymbol])

  const copyRoomCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(gameState.roomCode)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy room code:', err)
    }
  }, [gameState.roomCode])

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/20 animate-fade-in">
      {/* Room Code Display */}
      <div className="text-center mb-6 animate-slide-up">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl px-4 py-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Room:</span>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {gameState.roomCode}
          </span>
          <button
            onClick={copyRoomCode}
            className="ml-2 p-1 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            title="Copy room code"
          >
            📋
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center animate-slide-up">
        Players
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Player X */}
        <div className={`p-6 rounded-2xl border-2 transition-all duration-500 animate-slide-up ${
          currentPlayer === 'X' && gameStatus === 'playing'
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg shadow-blue-500/20 animate-glow'
            : 'border-gray-200 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800'
        } ${isCurrentPlayer('X') ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`} 
        style={{ animationDelay: '0.1s' }}>
          <div className="text-center">
            <div className="relative mb-4">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 animate-float">X</div>
              {currentPlayer === 'X' && gameStatus === 'playing' && (
                <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping"></div>
              )}
            </div>
            <div className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {players.X?.name || 'Waiting for player...'}
            </div>
            <div className={`text-sm font-bold ${getPlayerStatusColor('X')} mb-2`}>
              {getPlayerStatus('X')}
            </div>
            {isCurrentPlayer('X') && (
              <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                You
              </div>
            )}
          </div>
        </div>

        {/* Player O */}
        <div className={`p-6 rounded-2xl border-2 transition-all duration-500 animate-slide-up ${
          currentPlayer === 'O' && gameStatus === 'playing'
            ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 shadow-lg shadow-red-500/20 animate-glow'
            : 'border-gray-200 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800'
        } ${isCurrentPlayer('O') ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
        style={{ animationDelay: '0.2s' }}>
          <div className="text-center">
            <div className="relative mb-4">
              <div className="text-4xl font-bold text-red-600 dark:text-red-400 animate-float" style={{ animationDelay: '1s' }}>O</div>
              {currentPlayer === 'O' && gameStatus === 'playing' && (
                <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping"></div>
              )}
            </div>
            <div className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {players.O?.name || 'Waiting for player...'}
            </div>
            <div className={`text-sm font-bold ${getPlayerStatusColor('O')} mb-2`}>
              {getPlayerStatus('O')}
            </div>
            {isCurrentPlayer('O') && (
              <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                You
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Turn Indicator */}
      {gameStatus === 'playing' && (
        <div className="mt-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="inline-flex items-center px-6 py-3 rounded-2xl text-base font-bold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg">
            <div className={`w-3 h-3 rounded-full mr-3 animate-pulse ${
              currentPlayer === 'X' ? 'bg-blue-500' : 'bg-red-500'
            }`}></div>
            {currentPlayer === playerSymbol ? (
              <span className="text-green-600 dark:text-green-400">Your turn! 🎯</span>
            ) : (
              <span>{players[currentPlayer]?.name || currentPlayer}&apos;s turn</span>
            )}
          </div>
        </div>
      )}

      {/* Game Status Messages */}
      {gameStatus === 'waiting' && (
        <div className="mt-6 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="inline-flex items-center px-6 py-3 rounded-2xl text-base font-bold bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-300 shadow-lg">
            <div className="flex space-x-1 mr-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            Waiting for Player O to join... 
          </div>
        </div>
      )}
    </div>
  )
})

export default PlayerInfo