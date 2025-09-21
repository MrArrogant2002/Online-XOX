<<<<<<< HEAD
# Online XOX - Real-time Multiplayer Tic Tac Toe

A modern, real-time multiplayer Tic Tac Toe game built with Next.js, TypeScript, Tailwind CSS, and Socket.IO.

## Features

- 🎮 **Real-time Multiplayer**: Play with friends in real-time using WebSockets
- 🎯 **Room-based Games**: Create or join games using unique room codes
- 📱 **Mobile Responsive**: Optimized for all device sizes
- 🎨 **Modern UI**: Clean, minimal design with Tailwind CSS
- ⚡ **Fast & Reliable**: Built on Next.js for optimal performance
- 🔄 **Auto-reconnection**: Handles disconnections gracefully
- 🏆 **Game Statistics**: Track wins, draws, and player info

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Socket.IO** - WebSocket implementation
- **Custom Game Engine** - Server-side game logic and validation

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern web browser with WebSocket support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-xox
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Alternative: Run with separate server

You can also run the frontend and backend separately:

```bash
# Terminal 1: Start the Next.js frontend
npm run dev

# Terminal 2: Start the Socket.IO server
npm run server
```

## Game Rules

1. **Create a Game**: Generate a unique room code and wait for a player to join
2. **Join a Game**: Enter a room code to join an existing game
3. **Gameplay**: Players alternate turns (X goes first)
4. **Winning**: Get three symbols in a row (horizontal, vertical, or diagonal)
5. **Draw**: Game ends in a draw if all squares are filled with no winner

## How to Play

1. **Enter your name** on the home screen
2. **Create a new game** or **join existing game** with room code
3. **Share the room code** with your friend
4. **Take turns** clicking empty squares
5. **Win by getting three in a row** or draw if board fills up
6. **Play again** or return to lobby

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout component
│   │   ├── page.tsx         # Home/lobby page
│   │   ├── game/            # Game page directory
│   │   └── globals.css      # Global styles
│   └── components/          # React components
│       ├── GameBoard.tsx    # Interactive game board
│       ├── PlayerInfo.tsx   # Player status display
│       ├── GameModal.tsx    # Win/draw result modal
│       └── LoadingSpinner.tsx # Loading indicator
├── server/
│   └── index.js            # Socket.IO server with game logic
├── public/                 # Static assets
└── Configuration files...
```

## Game Server Architecture

The server implements a robust game management system:

### Core Components

1. **GameManager Class**: Handles all game state and logic
2. **Room Management**: Creates and manages game rooms with unique codes
3. **Player Management**: Tracks player connections and assignments
4. **Move Validation**: Server-side validation prevents cheating
5. **Win Detection**: Automatic win/draw detection with winning line tracking
6. **Cleanup System**: Removes old/abandoned games automatically

### Socket Events

#### Client → Server
- `create-game`: Create new game room
- `join-game`: Join existing game room
- `make-move`: Submit a move (validated server-side)
- `reset-game`: Start new round
- `get-game-state`: Request current game state

#### Server → Client
- `game-created`: Game successfully created
- `game-joined`: Player joined game
- `game-updated`: Game state changed (moves, win, etc.)
- `game-reset`: New round started
- `player-disconnected`: Player left game
- `game-error`: Error occurred

## Extending to Other Games

This architecture can be easily extended to support other turn-based games:

### 1. **Game Logic Extension**
```javascript
// Add new game types to GameManager
createGame(roomCode, playerName, socketId, gameType = 'tic-tac-toe') {
  // Initialize different game states based on gameType
}
```

### 2. **Board Modifications**
```typescript
// Modify GameBoard component for different grid sizes
interface GameBoardProps {
  board: (string | null)[]
  gridSize: number // 3x3, 4x4, etc.
  // ... other props
}
```

### 3. **Rule Customization**
```javascript
// Extend win condition checking
checkGameEnd(board, gameType) {
  switch(gameType) {
    case 'tic-tac-toe': return this.checkTicTacToe(board)
    case 'connect-four': return this.checkConnectFour(board)
    // Add more game types...
  }
}
```

### 4. **UI Adaptation**
- Create game-specific components
- Modify styling for different board layouts
- Add game-specific rules and instructions

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   ```
   NEXT_PUBLIC_SERVER_URL=https://your-domain.vercel.app
   NODE_ENV=production
   CORS_ORIGIN=https://your-domain.vercel.app
   ```
3. **Deploy**: Vercel automatically builds and deploys

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SERVER_URL` | Frontend server URL | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `CORS_ORIGIN` | Allowed CORS origins for production | Production only |
| `PORT` | Server port (default: 3000) | No |

## Performance Considerations

- **Connection Pooling**: Efficient WebSocket connection management
- **Memory Management**: Automatic cleanup of old games and disconnected players
- **State Synchronization**: Minimal data transfer for real-time updates
- **Error Handling**: Graceful handling of network issues and disconnections

## Security Features

- **Server-side Validation**: All moves validated on server
- **Rate Limiting**: Prevents spam and abuse
- **Input Sanitization**: Clean user inputs
- **CORS Configuration**: Proper origin restrictions

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers with WebSocket support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

**Built with ❤️ using Next.js, TypeScript, and Socket.IO**