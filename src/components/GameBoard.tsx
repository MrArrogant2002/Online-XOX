import { memo, useCallback, useState } from 'react'

interface GameBoardProps {
  board: (string | null)[]
  onCellClick: (position: number) => void
  winningLine: number[] | null
  disabled: boolean
}

const GameBoard = memo(function GameBoard({ board, onCellClick, winningLine, disabled }: GameBoardProps) {
  const [clickedCell, setClickedCell] = useState<number | null>(null)

  const isWinningCell = useCallback((index: number) => {
    return winningLine && winningLine.includes(index)
  }, [winningLine])

  const getCellContent = useCallback((cell: string | null) => {
    if (!cell) return ''
    return cell
  }, [])

  const handleCellClick = useCallback((index: number) => {
    if (disabled || board[index] !== null) return
    
    setClickedCell(index)
    onCellClick(index)
    
    // Reset clicked cell after animation
    setTimeout(() => setClickedCell(null), 300)
  }, [disabled, board, onCellClick])

  const getCellClassName = useCallback((index: number) => {
    const baseClasses = "cell"
    const isWinner = isWinningCell(index)
    const isEmpty = board[index] === null
    const symbol = board[index]
    const isClicked = clickedCell === index
    
    let classes = baseClasses
    
    if (!disabled && isEmpty) {
      classes += " cell-hover"
    }
    
    if (isWinner) {
      classes += " winning-cell"
    }
    
    if (isClicked) {
      classes += " animate-scale-in"
    }
    
    if (symbol === 'X') {
      classes += " player-x"
    } else if (symbol === 'O') {
      classes += " player-o"
    }
    
    return classes
  }, [board, disabled, clickedCell, isWinningCell])

  const renderCell = useCallback((cell: string | null, index: number) => (
    <button
      key={index}
      className={getCellClassName(index)}
      onClick={() => handleCellClick(index)}
      disabled={disabled || cell !== null}
      aria-label={`Cell ${index + 1}${cell ? `, contains ${cell}` : ', empty'}`}
    >
      <span className="select-none transition-all duration-300">
        {getCellContent(cell)}
      </span>
      {/* Ripple effect overlay */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="ripple-effect w-full h-full"></div>
      </div>
    </button>
  ), [getCellClassName, handleCellClick, disabled, getCellContent])

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Game Board */}
      <div className="game-board animate-scale-in">
        {board.map((cell, index) => renderCell(cell, index))}
      </div>
      
      {/* Enhanced Game Legend */}
      <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white text-sm flex items-center justify-center font-bold shadow-lg">X</span>
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg blur opacity-25 animate-pulse"></div>
          </div>
          <span className="font-medium">Player X</span>
        </div>
        <div className="flex items-center space-x-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative">
            <span className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg text-white text-sm flex items-center justify-center font-bold shadow-lg">O</span>
            <div className="absolute -inset-1 bg-gradient-to-br from-red-500 to-red-600 rounded-lg blur opacity-25 animate-pulse"></div>
          </div>
          <span className="font-medium">Player O</span>
        </div>
      </div>

      {/* Game Instructions */}
      <div className="mt-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {disabled ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></span>
              Waiting for opponent...
            </span>
          ) : (
            'Click on any empty cell to make your move'
          )}
        </p>
      </div>
    </div>
  )
})

export default GameBoard