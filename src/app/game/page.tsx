'use client'

import { useState, useEffect } from 'react'
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

export default function GamePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [showModal, setShowModal] = useState(false)

  const roomCode = searchParams.get('room')
  const playerName = searchParams.get('name')
  const isCreator = searchParams.get('create') === 'true'

  useEffect(() => {
    if (!roomCode || !playerName) {
      router.push('/')
      return
    }

    // Initialize Socket.IO connection
    const newSocket = io(process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SERVER_URL || window.location.origin 
      : window.location.origin,
      {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true
      }
    )

    setSocket(newSocket)

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to server')
      setConnectionStatus('connected')
      
      if (isCreator) {
        newSocket.emit('create-game', { roomCode, playerName })
      } else {
        newSocket.emit('join-game', { roomCode, playerName })
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnectionStatus('disconnected')
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setConnectionStatus('error')
      setError('Failed to connect to game server')
    })

    // Game events
    newSocket.on('game-created', (data) => {
      console.log('Game created:', data)
      if (data.success) {
        setGameState(data.game)
        setPlayerSymbol(data.game.playerSymbol)
        setIsLoading(false)
      }
    })

    newSocket.on('game-joined', (data) => {
      console.log('Game joined:', data)
      if (data.success) {
        setGameState(data.game)
        setIsLoading(false)
      }
    })

    newSocket.on('player-assigned', (data) => {
      console.log('Player assigned:', data)
      setPlayerSymbol(data.playerSymbol)
    })

    newSocket.on('game-updated', (data) => {
      console.log('Game updated:', data)
      setGameState(prev => prev ? { ...prev, ...data } : null)
      
      // Show modal if game finished
      if (data.gameStatus === 'finished') {
        setTimeout(() => setShowModal(true), 500)
      }
    })

    newSocket.on('game-reset', (data) => {
      console.log('Game reset:', data)
      setGameState(prev => prev ? { ...prev, ...data } : null)
      setShowModal(false)
    })

    newSocket.on('player-disconnected', (data) => {
      console.log('Player disconnected:', data)
      setGameState(prev => prev ? { ...prev, players: data.game.players } : null)
    })

    newSocket.on('game-error', (data) => {
      console.error('Game error:', data)
      setError(data.message)
      setIsLoading(false)
    })

    return () => {
      newSocket.close()
    }
  }, [roomCode, playerName, isCreator, router])

  const handleCellClick = (position: number) => {
    if (!socket || !gameState || !playerSymbol) return
    
    // Check if it's the player's turn and the cell is empty
    if (gameState.currentPlayer !== playerSymbol || gameState.board[position] !== null) {
      return
    }
    
    socket.emit('make-move', { position })
  }

  const handlePlayAgain = () => {
    if (!socket) return
    socket.emit('reset-game')
  }

  const handleLeaveGame = () => {
    if (socket) {
      socket.close()
    }
    router.push('/')
  }

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode)
      // You could add a toast notification here
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={handleLeaveGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Room: {roomCode}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connection: <span className={`font-semibold ${
                  connectionStatus === 'connected' ? 'text-green-600' : 
                  connectionStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {connectionStatus}
                </span>
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={copyRoomCode}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Copy Code
              </button>
              <button
                onClick={handleLeaveGame}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Leave Game
              </button>
            </div>
          </div>
        </div>

        {/* Player Info */}
        <PlayerInfo 
          gameState={gameState}
          playerSymbol={playerSymbol}
        />

        {/* Game Board */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <GameBoard
            board={gameState.board}
            onCellClick={handleCellClick}
            winningLine={gameState.winningLine}
            disabled={gameState.gameStatus !== 'playing' || gameState.currentPlayer !== playerSymbol}
          />
        </div>

        {/* Game Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
          {gameState.gameStatus === 'waiting' && (
            <div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                Waiting for another player to join...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Share the room code: <span className="font-mono font-bold">{roomCode}</span>
              </p>
            </div>
          )}
          
          {gameState.gameStatus === 'playing' && (
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {gameState.currentPlayer === playerSymbol ? 
                  "Your turn!" : 
                  `Waiting for ${gameState.players[gameState.currentPlayer]?.name || gameState.currentPlayer}'s move...`
                }
              </p>
            </div>
          )}
          
          {gameState.gameStatus === 'finished' && (
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {gameState.winner ? 
                  `${gameState.players[gameState.winner]?.name || gameState.winner} wins!` : 
                  "It's a draw!"
                }
              </p>
              <button
                onClick={handlePlayAgain}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Game Result Modal */}
      {showModal && (
        <GameModal
          gameState={gameState}
          playerSymbol={playerSymbol}
          onPlayAgain={handlePlayAgain}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}