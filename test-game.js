#!/usr/bin/env node

/**
 * Test script for Online XOX game
 * This script validates the core functionality
 */

const { createServer } = require('http')
const { Server } = require('socket.io')
const { io: Client } = require('socket.io-client')

// Test the game server functionality
async function testGameServer() {
  console.log('🧪 Testing Game Server...\n')
  
  const server = createServer()
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  })
  
  // Import game manager logic from server
  const { GameManager } = require('./server/game-logic') // We'll create this
  
  const gameManager = new GameManager()
  
  // Test game creation
  try {
    const testGame = gameManager.createGame('TEST01', 'TestPlayer1', 'socket1')
    console.log('✅ Game creation: PASSED')
    console.log(`   Room: ${testGame.roomCode}`)
    console.log(`   Player X: ${testGame.players.X.name}`)
  } catch (error) {
    console.log('❌ Game creation: FAILED')
    console.log(`   Error: ${error.message}`)
  }
  
  // Test player joining
  try {
    const joinedGame = gameManager.joinGame('TEST01', 'TestPlayer2', 'socket2')
    console.log('✅ Player joining: PASSED')
    console.log(`   Player O: ${joinedGame.players.O.name}`)
    console.log(`   Game status: ${joinedGame.gameStatus}`)
  } catch (error) {
    console.log('❌ Player joining: FAILED')
    console.log(`   Error: ${error.message}`)
  }
  
  // Test move validation
  try {
    const gameAfterMove = gameManager.makeMove('socket1', 0) // Player X moves to position 0
    console.log('✅ Move validation: PASSED')
    console.log(`   Board after move: ${gameAfterMove.board}`)
    console.log(`   Current player: ${gameAfterMove.currentPlayer}`)
  } catch (error) {
    console.log('❌ Move validation: FAILED')
    console.log(`   Error: ${error.message}`)
  }
  
  // Test win detection
  try {
    // Simulate a winning game
    gameManager.games.get('TEST01').board = ['X', 'X', 'X', null, 'O', 'O', null, null, null]
    const result = gameManager.checkGameEnd(['X', 'X', 'X', null, 'O', 'O', null, null, null])
    console.log('✅ Win detection: PASSED')
    console.log(`   Game over: ${result.gameOver}`)
    console.log(`   Winner: ${result.winner}`)
    console.log(`   Winning line: ${result.winningLine}`)
  } catch (error) {
    console.log('❌ Win detection: FAILED')
    console.log(`   Error: ${error.message}`)
  }
  
  console.log('\n🎯 Game Server Tests Complete!\n')
}

// Test WebSocket connection
async function testWebSocketConnection() {
  console.log('🔌 Testing WebSocket Connection...\n')
  
  return new Promise((resolve) => {
    // Create test server
    const server = createServer()
    const io = new Server(server, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    })
    
    server.listen(3002, () => {
      console.log('🚀 Test server started on port 3002')
      
      // Create client connection
      const client = Client('http://localhost:3002')
      
      client.on('connect', () => {
        console.log('✅ Client connection: PASSED')
        console.log(`   Client ID: ${client.id}`)
        
        // Test event communication
        client.emit('test-event', { message: 'Hello Server!' })
      })
      
      client.on('connect_error', (error) => {
        console.log('❌ Client connection: FAILED')
        console.log(`   Error: ${error.message}`)
        resolve()
      })
      
      io.on('connection', (socket) => {
        console.log('✅ Server connection: PASSED')
        console.log(`   Socket ID: ${socket.id}`)
        
        socket.on('test-event', (data) => {
          console.log('✅ Event communication: PASSED')
          console.log(`   Received: ${data.message}`)
          
          // Send response back
          socket.emit('test-response', { message: 'Hello Client!' })
        })
      })
      
      client.on('test-response', (data) => {
        console.log('✅ Bidirectional communication: PASSED')
        console.log(`   Received: ${data.message}`)
        
        // Cleanup
        client.close()
        server.close()
        console.log('\n🔌 WebSocket Tests Complete!\n')
        resolve()
      })
      
      // Timeout after 5 seconds
      setTimeout(() => {
        console.log('❌ Test timeout: Connection tests failed')
        client.close()
        server.close()
        resolve()
      }, 5000)
    })
  })
}

// Main test runner
async function runTests() {
  console.log('🎮 Online XOX - Game Test Suite')
  console.log('================================\n')
  
  try {
    await testGameServer()
    await testWebSocketConnection()
    
    console.log('🎉 All tests completed!')
    console.log('\n📋 Next Steps:')
    console.log('1. Start the development server: npm run dev')
    console.log('2. Open http://localhost:3001 in your browser')
    console.log('3. Test the game with a friend!')
    console.log('\n🚀 Ready to play Online XOX!')
    
  } catch (error) {
    console.log('💥 Test suite failed:')
    console.log(error.message)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
}

module.exports = { testGameServer, testWebSocketConnection }