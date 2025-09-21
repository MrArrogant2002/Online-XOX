import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'

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
  createdAt: number
}

// Game state management (same as server/index.js)
class GameManager {
  public games: Map<string, GameState>
  public playerRooms: Map<string, string>

  constructor() {
    this.games = new Map() // roomCode -> gameState
    this.playerRooms = new Map() // socketId -> roomCode
  }

  createGame(roomCode: string, playerName: string, socketId: string): GameState {
    const gameState: GameState = {
      roomCode,
      players: {
        X: { name: playerName, socketId, connected: true },
        O: null
      },
      board: Array(9).fill(null),
      currentPlayer: 'X',
      gameStatus: 'waiting',
      winner: null,
      winningLine: null,
      createdAt: Date.now()
    }
    
    this.games.set(roomCode, gameState)
    this.playerRooms.set(socketId, roomCode)
    return gameState
  }

  joinGame(roomCode: string, playerName: string, socketId: string): GameState {
    const game = this.games.get(roomCode)
    if (!game) {
      throw new Error('Game not found')
    }
    
    if (game.players.O) {
      throw new Error('Game is full')
    }
    
    if (game.gameStatus !== 'waiting') {
      throw new Error('Game already in progress')
    }
    
    game.players.O = { name: playerName, socketId, connected: true }
    game.gameStatus = 'playing'
    this.playerRooms.set(socketId, roomCode)
    
    return game
  }

  makeMove(socketId: string, position: number): GameState {
    const roomCode = this.playerRooms.get(socketId)
    const game = roomCode ? this.games.get(roomCode) : null
    
    if (!game) {
      throw new Error('Game not found')
    }
    
    if (game.gameStatus !== 'playing') {
      throw new Error('Game not in progress')
    }
    
    // Validate player turn
    const playerSymbol = this.getPlayerSymbol(socketId, game)
    if (playerSymbol !== game.currentPlayer) {
      throw new Error('Not your turn')
    }
    
    // Validate move
    if (position < 0 || position > 8 || game.board[position] !== null) {
      throw new Error('Invalid move')
    }
    
    // Make the move
    game.board[position] = playerSymbol
    
    // Check for win or draw
    const result = this.checkGameEnd(game.board)
    if (result.gameOver) {
      game.gameStatus = 'finished'
      game.winner = result.winner || null
      game.winningLine = result.winningLine || null
    } else {
      // Switch turns
      game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X'
    }
    
    return game
  }

  getPlayerSymbol(socketId: string, game: GameState): 'X' | 'O' | null {
    if (game.players.X && game.players.X.socketId === socketId) return 'X'
    if (game.players.O && game.players.O.socketId === socketId) return 'O'
    return null
  }

  checkGameEnd(board: (string | null)[]): { gameOver: boolean; winner?: 'X' | 'O' | null; winningLine?: number[] | null } {
    // Winning combinations
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]
    
    // Check for wins
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          gameOver: true,
          winner: board[a] as 'X' | 'O',
          winningLine: pattern
        }
      }
    }
    
    // Check for draw
    if (board.every((cell: string | null) => cell !== null)) {
      return {
        gameOver: true,
        winner: null,
        winningLine: null
      }
    }
    
    return { gameOver: false, winner: null, winningLine: null }
  }

  resetGame(roomCode: string): GameState | null {
    const game = this.games.get(roomCode)
    if (!game) return null
    
    game.board = Array(9).fill(null)
    game.currentPlayer = 'X'
    game.gameStatus = 'playing'
    game.winner = null
    game.winningLine = null
    
    return game
  }

  handleDisconnection(socketId: string): { roomCode: string; game: GameState } | null {
    const roomCode = this.playerRooms.get(socketId)
    if (!roomCode) return null
    
    const game = this.games.get(roomCode)
    if (!game) return null
    
    // Mark player as disconnected
    if (game.players.X && game.players.X.socketId === socketId) {
      game.players.X.connected = false
    }
    if (game.players.O && game.players.O.socketId === socketId) {
      game.players.O.connected = false
    }
    
    // Clean up if both players disconnected or game is very old
    const now = Date.now()
    const gameAge = now - game.createdAt
    const bothDisconnected = 
      (!game.players.X || !game.players.X.connected) && 
      (!game.players.O || !game.players.O.connected)
    
    if (bothDisconnected || gameAge > 24 * 60 * 60 * 1000) { // 24 hours
      this.games.delete(roomCode)
    }
    
    this.playerRooms.delete(socketId)
    return { roomCode, game }
  }

  getGame(roomCode: string): GameState | undefined {
    return this.games.get(roomCode)
  }
}

// Global game manager instance
const gameManager = new GameManager()

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: any & {
    server: NetServer & {
      io?: ServerIO
    }
  }
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new ServerIO(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.CORS_ORIGIN 
          : ["http://localhost:3001", "http://10.177.184.147:3001"],
        methods: ["GET", "POST"],
        credentials: true
      }
    })
    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // Create game event
      socket.on('create-game', ({ roomCode, playerName }) => {
        try {
          const game = gameManager.createGame(roomCode, playerName, socket.id)
          socket.join(roomCode)
          
          socket.emit('game-created', {
            success: true,
            game: {
              roomCode: game.roomCode,
              players: game.players,
              board: game.board,
              currentPlayer: game.currentPlayer,
              gameStatus: game.gameStatus,
              playerSymbol: 'X'
            }
          })
          
          console.log(`Game created: ${roomCode} by ${playerName}`)
        } catch (error: any) {
          socket.emit('game-error', { message: error?.message || 'Unknown error' })
        }
      })

      // Join game event
      socket.on('join-game', ({ roomCode, playerName }) => {
        try {
          const game = gameManager.joinGame(roomCode, playerName, socket.id)
          socket.join(roomCode)
          
          // Notify both players
          io.to(roomCode).emit('game-joined', {
            success: true,
            game: {
              roomCode: game.roomCode,
              players: game.players,
              board: game.board,
              currentPlayer: game.currentPlayer,
              gameStatus: game.gameStatus
            }
          })
          
          // Send player-specific data
          socket.emit('player-assigned', { playerSymbol: 'O' })
          socket.to(roomCode).emit('player-assigned', { playerSymbol: 'X' })
          
          console.log(`${playerName} joined game: ${roomCode}`)
        } catch (error: any) {
          socket.emit('game-error', { message: error?.message || 'Unknown error' })
        }
      })

      // Make move event
      socket.on('make-move', ({ position }) => {
        try {
          const game = gameManager.makeMove(socket.id, position)
          const roomCode = gameManager.playerRooms.get(socket.id)
          
          if (roomCode) {
            // Broadcast updated game state to all players in the room
            io.to(roomCode).emit('game-updated', {
              board: game.board,
              currentPlayer: game.currentPlayer,
              gameStatus: game.gameStatus,
              winner: game.winner,
              winningLine: game.winningLine
            })
            
            console.log(`Move made in room ${roomCode}: position ${position}`)
          }
        } catch (error: any) {
          socket.emit('game-error', { message: error?.message || 'Unknown error' })
        }
      })

      // Reset game event
      socket.on('reset-game', () => {
        try {
          const roomCode = gameManager.playerRooms.get(socket.id)
          if (roomCode) {
            const game = gameManager.resetGame(roomCode)
            
            if (game) {
              io.to(roomCode).emit('game-reset', {
                board: game.board,
                currentPlayer: game.currentPlayer,
                gameStatus: game.gameStatus,
                winner: game.winner,
                winningLine: game.winningLine
              })
              
              console.log(`Game reset in room: ${roomCode}`)
            }
          }
        } catch (error: any) {
          socket.emit('game-error', { message: error?.message || 'Unknown error' })
        }
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
        
        const result = gameManager.handleDisconnection(socket.id)
        if (result) {
          const { roomCode, game } = result
          // Notify remaining player about disconnection
          socket.to(roomCode).emit('player-disconnected', {
            game: {
              players: game.players,
              gameStatus: game.gameStatus
            }
          })
        }
      })

      // Get game state event (for reconnections)
      socket.on('get-game-state', ({ roomCode }) => {
        const game = gameManager.getGame(roomCode)
        if (game) {
          socket.emit('game-state', {
            success: true,
            game: {
              roomCode: game.roomCode,
              players: game.players,
              board: game.board,
              currentPlayer: game.currentPlayer,
              gameStatus: game.gameStatus,
              winner: game.winner,
              winningLine: game.winningLine
            }
          })
        } else {
          socket.emit('game-error', { message: 'Game not found' })
        }
      })
    })
  }
  res.end()
}

export default SocketHandler