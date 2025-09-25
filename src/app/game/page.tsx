'use client'

import { useState, useEffect, Suspense, useCallback, useMemo, memo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import GameBoard from '@/components/GameBoard'
import GameModal from '@/components/GameModal'
import PlayerInfo from '@/components/PlayerInfo'
import LoadingSpinner from '@/components/LoadingSpinner'

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

// Memoized error component
const ErrorDisplay = memo(function ErrorDisplay({ 
  error, 
  onBackToHome 
}: { 
  error: string
  onBackToHome: () => void 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border border-white/20 dark:border-gray-700/20">
        <div className="text-6xl mb-6 animate-bounce-slow">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Connection Error
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {error}
        </p>
        <button
          onClick={onBackToHome}
          className="btn-primary ripple-effect"
        >
          🏠 Back to Home
        </button>
      </div>
    </div>
  )
})

// Memoized game header component
const GameHeader = memo(function GameHeader({
  roomCode,
  connectionStatus,
  onCopyCode,
  onLeaveGame
}: {
  roomCode: string
  connectionStatus: string
  onCopyCode: () => void
  onLeaveGame: () => void
}) {
  const statusColors = useMemo(() => ({
    connected: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    reconnecting: 'text-yellow-600 dark:text-yellow-400',
    connecting: 'text-blue-600 dark:text-blue-400'
  }), [])

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-6 border border-white/20 dark:border-gray-700/20 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Room: {roomCode}
          </h1>
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-bounce'
            }`}></div>
            <p className="text-gray-600 dark:text-gray-400">
              Status: <span className={`font-semibold ${statusColors[connectionStatus as keyof typeof statusColors] || 'text-gray-500'}`}>
                {connectionStatus}
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onCopyCode}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 ripple-effect"
          >
            📋 Copy Code
          </button>
          <button
            onClick={onLeaveGame}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-600 ripple-effect"
          >
            🚪 Leave Game
          </button>
        </div>
      </div>
    </div>
  )
})

// Memoized game status component
const GameStatus = memo(function GameStatus({
  gameState,
  playerSymbol,
  roomCode,
  onPlayAgain
}: {
  gameState: GameState
  playerSymbol: 'X' | 'O' | null
  roomCode: string
  onPlayAgain: () => void
}) {
  const statusContent = useMemo(() => {
    if (gameState.gameStatus === 'waiting') {
      return (
        <div className="animate-slide-up">
          <div className="flex items-center justify-center mb-4">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Waiting for another player to join...
          </p>
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl px-4 py-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Share room code:</span>
            <span className="font-mono font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {roomCode}
            </span>
          </div>
        </div>
      )
    }

    if (gameState.gameStatus === 'playing') {
      const isMyTurn = gameState.currentPlayer === playerSymbol
      return (
        <div className="animate-slide-up">
          <div className={`inline-flex items-center px-6 py-3 rounded-2xl text-lg font-bold shadow-lg ${
            isMyTurn 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white animate-pulse'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200'
          }`}>
            <div className={`w-4 h-4 rounded-full mr-3 ${
              isMyTurn ? 'bg-white animate-ping' : 'bg-yellow-500 animate-bounce'
            }`}></div>
            {isMyTurn ? 
              "🎯 Your turn! Make your move" : 
              `⏳ Waiting for ${gameState.players[gameState.currentPlayer]?.name || gameState.currentPlayer}&apos;s move...`
            }
          </div>
        </div>
      )
    }

    if (gameState.gameStatus === 'finished') {
      const isWinner = gameState.winner === playerSymbol
      const isDraw = !gameState.winner
      
      return (
        <div className="animate-slide-up">
          <div className="text-6xl mb-4 animate-bounce-slow">
            {isDraw ? '🤝' : isWinner ? '🎉' : '😔'}
          </div>
          <p className={`text-2xl font-bold mb-6 ${
            isDraw ? 'text-yellow-600 dark:text-yellow-400' : 
            isWinner ? 'text-green-600 dark:text-green-400' : 
            'text-red-600 dark:text-red-400'
          }`}>
            {isDraw ? "It&apos;s a draw!" :
             isWinner ? "You won! 🏆" :
             `${gameState.players[gameState.winner!]?.name || gameState.winner} wins!`
            }
          </p>
          <button
            onClick={onPlayAgain}
            className="btn-secondary ripple-effect"
          >
            🔄 Play Again
          </button>
        </div>
      )
    }

    return null
  }, [gameState, playerSymbol, roomCode, onPlayAgain])

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center border border-white/20 dark:border-gray-700/20 animate-fade-in">
      {statusContent}
    </div>
  )
})

function GameContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [showModal, setShowModal] = useState(false)

  const roomCode = searchParams?.get('room')
  const playerName = searchParams?.get('name')
  const isCreator = searchParams?.get('create') === 'true'

  // Memoized socket configuration
  const socketConfig = useMemo(() => ({
    path: '/api/socket',
    addTrailingSlash: false,
    transports: ['polling'],
    upgrade: false,
    rememberUpgrade: false,
    forceNew: true,
    autoConnect: true,
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
    closeOnBeforeunload: true,
    query: {
      v: Date.now(),
      transport: 'polling'
    }
  }), [])

  // Optimized event handlers with useCallback
  const handleCellClick = useCallback((position: number) => {
    if (!socket || !gameState || !playerSymbol) return
    
    if (gameState.currentPlayer !== playerSymbol || gameState.board[position] !== null) {
      return
    }
    
    socket.emit('make-move', { position })
  }, [socket, gameState, playerSymbol])

  const handlePlayAgain = useCallback(() => {
    if (!socket) return
    socket.emit('reset-game')
  }, [socket])

  const handleLeaveGame = useCallback(() => {
    if (socket) {
      socket.close()
    }
    router.push('/')
  }, [socket, router])

  const copyRoomCode = useCallback(async () => {
    if (roomCode) {
      try {
        await navigator.clipboard.writeText(roomCode)
        // Could add toast notification here
      } catch (err) {
        console.error('Failed to copy room code:', err)
      }
    }
  }, [roomCode])

  const handleModalClose = useCallback(() => {
    setShowModal(false)
  }, [])

  // Socket connection effect with proper cleanup and memoized handlers
  useEffect(() => {
    if (!roomCode || !playerName) {
      router.push('/')
      return
    }

    const newSocket = io(socketConfig)
    setSocket(newSocket)

    // Connection event handlers
    const handleConnect = () => {
      console.log('✅ Connected to server successfully')
      setConnectionStatus('connected')
      setError('')
      
      if (isCreator) {
        console.log('Creating game...')
        newSocket.emit('create-game', { roomCode, playerName })
      } else {
        console.log('Joining game...')
        newSocket.emit('join-game', { roomCode, playerName })
      }
    }

    const handleDisconnect = (reason: string) => {
      console.log(`❌ Disconnected from server. Reason: ${reason}`)
      setConnectionStatus('disconnected')
      
      if (reason === 'transport close' || reason === 'transport error') {
        setError('Connection lost. Attempting to reconnect...')
      }
    }

    const handleConnectError = (error: Error) => {
      console.error('❌ Connection error:', error)
      setConnectionStatus('error')
      
      if (error.message.includes('server error')) {
        setError('Server is temporarily unavailable. Retrying...')
      } else if (error.message.includes('timeout')) {
        setError('Connection timeout. Please check your internet connection.')
      } else {
        setError('Failed to connect to game server. Please try again.')
      }
    }

    const handleReconnect = (attemptNumber: number) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`)
      setConnectionStatus('connected')
      setError('')
    }

    const handleReconnectAttempt = (attemptNumber: number) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`)
      setConnectionStatus('reconnecting')
      setError(`Reconnecting... (attempt ${attemptNumber}/5)`)
    }

    const handleReconnectFailed = () => {
      console.error('❌ All reconnection attempts failed')
      setConnectionStatus('error')
      setError('Unable to reconnect. Please refresh the page.')
    }

    // Game event handlers
    const handleGameCreated = (data: any) => {
      console.log('Game created:', data)
      if (data.success) {
        setGameState(data.game)
        setPlayerSymbol(data.game.playerSymbol)
        setIsLoading(false)
      }
    }

    const handleGameJoined = (data: any) => {
      console.log('Game joined:', data)
      if (data.success) {
        setGameState(data.game)
        setIsLoading(false)
      }
    }

    const handlePlayerAssigned = (data: any) => {
      console.log('Player assigned:', data)
      setPlayerSymbol(data.playerSymbol)
    }

    const handleGameUpdated = (data: any) => {
      console.log('Game updated:', data)
      setGameState(prev => prev ? { ...prev, ...data } : null)
      
      if (data.gameStatus === 'finished') {
        setTimeout(() => setShowModal(true), 500)
      }
    }

    const handleGameReset = (data: any) => {
      console.log('Game reset:', data)
      setGameState(prev => prev ? { ...prev, ...data } : null)
      setShowModal(false)
    }

    const handlePlayerDisconnected = (data: any) => {
      console.log('Player disconnected:', data)
      setGameState(prev => prev ? { ...prev, players: data.game.players } : null)
    }

    const handleGameError = (data: any) => {
      console.error('Game error:', data)
      setError(data.message)
      setIsLoading(false)
    }

    // Attach event listeners
    newSocket.on('connect', handleConnect)
    newSocket.on('disconnect', handleDisconnect)
    newSocket.on('connect_error', handleConnectError)
    newSocket.on('reconnect', handleReconnect)
    newSocket.on('reconnect_attempt', handleReconnectAttempt)
    newSocket.on('reconnect_failed', handleReconnectFailed)
    newSocket.on('game-created', handleGameCreated)
    newSocket.on('game-joined', handleGameJoined)
    newSocket.on('player-assigned', handlePlayerAssigned)
    newSocket.on('game-updated', handleGameUpdated)
    newSocket.on('game-reset', handleGameReset)
    newSocket.on('player-disconnected', handlePlayerDisconnected)
    newSocket.on('game-error', handleGameError)

    return () => {
      newSocket.close()
    }
  }, [roomCode, playerName, isCreator, router, socketConfig])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Connecting to game..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return <ErrorDisplay error={error} onBackToHome={handleLeaveGame} />
  }

  // No game state
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading game state..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 relative">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-10 w-16 h-16 bg-purple-500/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-red-500/10 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GameHeader
          roomCode={roomCode!}
          connectionStatus={connectionStatus}
          onCopyCode={copyRoomCode}
          onLeaveGame={handleLeaveGame}
        />

        {/* Player Info */}
        <PlayerInfo 
          gameState={gameState}
          playerSymbol={playerSymbol}
        />

        {/* Game Board */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-6 border border-white/20 dark:border-gray-700/20 animate-fade-in">
          <GameBoard
            board={gameState.board}
            onCellClick={handleCellClick}
            winningLine={gameState.winningLine}
            disabled={gameState.gameStatus !== 'playing' || gameState.currentPlayer !== playerSymbol}
          />
        </div>

        {/* Game Status */}
        <GameStatus
          gameState={gameState}
          playerSymbol={playerSymbol}
          roomCode={roomCode!}
          onPlayAgain={handlePlayAgain}
        />
      </div>

      {/* Game Result Modal */}
      {showModal && (
        <GameModal
          gameState={gameState}
          playerSymbol={playerSymbol}
          onPlayAgain={handlePlayAgain}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading game..." />
      </div>
    }>
      <GameContent />
    </Suspense>
  )
}