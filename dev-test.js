#!/usr/bin/env node

/**
 * Development Test Script for Online XOX
 * This script helps test the application during development
 */

const { spawn } = require('child_process')
const path = require('path')
const os = require('os')

console.log('🎮 Online XOX - Development Test Helper')
console.log('=====================================\n')

// Function to open URL in default browser
function openBrowser(url) {
  const start = os.platform() === 'darwin' ? 'open' : 
                os.platform() === 'win32' ? 'start' : 'xdg-open'
  
  if (os.platform() === 'win32') {
    spawn('cmd', ['/c', 'start', url], { stdio: 'ignore' })
  } else {
    spawn(start, [url], { stdio: 'ignore' })
  }
}

// Check if server is running
function checkServer() {
  console.log('🔍 Checking if development server is running...')
  
  const http = require('http')
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'GET',
    timeout: 3000
  }

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      console.log('✅ Server is running on http://localhost:3001')
      resolve(true)
    })

    req.on('error', () => {
      console.log('❌ Server is not running. Please start it with: npm run dev')
      resolve(false)
    })

    req.on('timeout', () => {
      console.log('⏱️  Server response timeout')
      resolve(false)
    })

    req.setTimeout(3000)
    req.end()
  })
}

// Main test function
async function runTests() {
  const isServerRunning = await checkServer()
  
  if (!isServerRunning) {
    console.log('\n📝 To start the server:')
    console.log('   npm run dev')
    console.log('\n🌐 Then open: http://localhost:3001')
    return
  }

  console.log('\n🎯 Testing Guide:')
  console.log('=================')
  console.log('1. Open two browser tabs/windows')
  console.log('2. In first tab: Create a game')
  console.log('3. Copy the room code')
  console.log('4. In second tab: Join with the room code')
  console.log('5. Play Tic Tac Toe in real-time!')
  
  console.log('\n🔧 Troubleshooting:')
  console.log('===================')
  console.log('• If you see hydration warnings: These are caused by browser extensions')
  console.log('• If Socket.IO fails: Check that server is running on port 3001')
  console.log('• If CORS errors: Make sure both frontend and backend use same port')
  
  console.log('\n🚀 Opening browser...')
  setTimeout(() => {
    openBrowser('http://localhost:3001')
  }, 1000)
  
  console.log('\n📊 Development URLs:')
  console.log('• Game: http://localhost:3001')
  console.log('• Network: http://10.177.184.147:3001 (for testing on mobile)')
}

// Check command line arguments
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node dev-test.js [options]')
  console.log('Options:')
  console.log('  --help, -h     Show this help message')
  console.log('  --no-browser   Don\'t open browser automatically')
  process.exit(0)
}

// Run the tests
runTests().catch(console.error)