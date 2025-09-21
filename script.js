class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = {
            X: 0,
            O: 0,
            draw: 0
        };
        
        this.winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        // Performance optimization: Cache DOM elements first
        this.cacheElements();
        this.initializeEventListeners();
        this.loadScores();
        this.updateDisplay();
        
        // Initialize service worker for PWA
        this.initializeServiceWorker();
    }

    cacheElements() {
        this.elements = {
            cells: document.querySelectorAll('.cell'),
            gameBoard: document.getElementById('gameBoard'),
            currentPlayerText: document.getElementById('currentPlayerText'),
            turnIndicator: document.getElementById('turnIndicator'),
            scoreX: document.getElementById('scoreX'),
            scoreO: document.getElementById('scoreO'),
            scoreDraw: document.getElementById('scoreDraw'),
            resetBtn: document.getElementById('resetBtn'),
            resetScoreBtn: document.getElementById('resetScoreBtn'),
            gameOverlay: document.getElementById('gameOverlay'),
            gameResult: document.getElementById('gameResult'),
            gameMessage: document.getElementById('gameMessage'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            winningLine: document.getElementById('winningLine')
        };
    }

    initializeEventListeners() {
        // Use event delegation for better performance
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Touch events for mobile
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    }

    handleDocumentClick(event) {
        const target = event.target;
        
        if (target.classList.contains('cell')) {
            this.makeMove(parseInt(target.dataset.index));
        } else if (target.id === 'resetBtn' || target.closest('#resetBtn')) {
            this.resetGame();
        } else if (target.id === 'resetScoreBtn' || target.closest('#resetScoreBtn')) {
            this.resetScores();
        } else if (target.id === 'playAgainBtn' || target.closest('#playAgainBtn')) {
            this.resetGame();
            this.hideModal();
        } else if (target.id === 'closeModalBtn' || target.closest('#closeModalBtn')) {
            this.hideModal();
        } else if (target.id === 'gameOverlay') {
            this.hideModal();
        }
    }

    handleKeydown(event) {
        if (!this.gameActive) return;
        
        // Allow keyboard navigation (1-9 keys)
        const keyNum = parseInt(event.key);
        if (keyNum >= 1 && keyNum <= 9) {
            this.makeMove(keyNum - 1);
        }
        
        // ESC to close modal
        if (event.key === 'Escape') {
            this.hideModal();
        }
        
        // R to reset game
        if (event.key.toLowerCase() === 'r') {
            this.resetGame();
        }
    }

    handleTouchStart(event) {
        // Add haptic feedback on mobile devices
        if (navigator.vibrate && event.target.classList.contains('cell')) {
            navigator.vibrate(50);
        }
    }

    makeMove(index) {
        if (!this.gameActive || this.board[index] !== '') {
            return;
        }

        // Optimistic UI update
        this.board[index] = this.currentPlayer;
        this.updateCell(index, this.currentPlayer);
        
        // Check for game end conditions
        const gameResult = this.checkGameEnd();
        
        if (gameResult) {
            this.endGame(gameResult);
        } else {
            this.switchPlayer();
        }
    }

    updateCell(index, player) {
        const cell = this.elements.cells[index];
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        
        // Add entrance animation
        cell.style.animation = 'none';
        cell.offsetHeight; // Trigger reflow
        cell.style.animation = player === 'X' ? 'cellFillX 0.5s ease-out' : 'cellFillO 0.5s ease-out';
        
        // Performance: Remove animation event listener after completion
        const handleAnimationEnd = () => {
            cell.style.animation = '';
            cell.removeEventListener('animationend', handleAnimationEnd);
        };
        cell.addEventListener('animationend', handleAnimationEnd);
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }

    checkGameEnd() {
        // Check for wins
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return {
                    type: 'win',
                    player: this.board[a],
                    winningCells: condition
                };
            }
        }
        
        // Check for draw
        if (this.board.every(cell => cell !== '')) {
            return { type: 'draw' };
        }
        
        return null;
    }

    endGame(result) {
        this.gameActive = false;
        
        if (result.type === 'win') {
            this.scores[result.player]++;
            this.highlightWinningCells(result.winningCells);
            this.showWinningLine(result.winningCells);
            this.showModal(`Player ${result.player} Wins! 🎉`, `Congratulations! Player ${result.player} wins this round.`);
        } else if (result.type === 'draw') {
            this.scores.draw++;
            this.showModal("It's a Draw! 🤝", "Great game! Both players played well.");
        }
        
        this.updateScoreDisplay();
        this.saveScores();
    }

    highlightWinningCells(winningCells) {
        winningCells.forEach((index, i) => {
            setTimeout(() => {
                this.elements.cells[index].classList.add('winning');
            }, i * 100);
        });
    }

    showWinningLine(winningCells) {
        const [a, b, c] = winningCells;
        const cellA = this.elements.cells[a];
        const cellC = this.elements.cells[c];
        
        const boardRect = this.elements.gameBoard.getBoundingClientRect();
        const cellARect = cellA.getBoundingClientRect();
        const cellCRect = cellC.getBoundingClientRect();
        
        const line = this.elements.winningLine;
        
        // Calculate line position and rotation
        const x1 = cellARect.left + cellARect.width / 2 - boardRect.left;
        const y1 = cellARect.top + cellARect.height / 2 - boardRect.top;
        const x2 = cellCRect.left + cellCRect.width / 2 - boardRect.left;
        const y2 = cellCRect.top + cellCRect.height / 2 - boardRect.top;
        
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        line.style.width = `${length}px`;
        line.style.height = '4px';
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 50%';
        
        // Show the line with animation
        requestAnimationFrame(() => {
            line.classList.add('show');
        });
    }

    showModal(title, message) {
        this.elements.gameResult.textContent = title;
        this.elements.gameMessage.textContent = message;
        
        // Use requestAnimationFrame for smooth animation
        requestAnimationFrame(() => {
            this.elements.gameOverlay.classList.add('show');
        });
        
        // Add confetti effect for wins
        if (title.includes('Wins')) {
            this.createConfetti();
        }
    }

    hideModal() {
        this.elements.gameOverlay.classList.remove('show');
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1001;
        `;
        
        document.body.appendChild(confettiContainer);
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                animation: confettiFall 3s linear forwards;
                opacity: 0;
            `;
            
            confettiContainer.appendChild(confetti);
            
            // Start animation with delay
            setTimeout(() => {
                confetti.style.opacity = '1';
            }, Math.random() * 1000);
        }
        
        // Clean up confetti
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 4000);
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Reset cells with staggered animation
        this.elements.cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.textContent = '';
                cell.className = 'cell';
                cell.style.animation = 'cellFillX 0.3s ease-out reverse';
            }, index * 50);
        });
        
        // Hide winning line
        this.elements.winningLine.classList.remove('show');
        
        this.updateDisplay();
        this.hideModal();
    }

    resetScores() {
        this.scores = { X: 0, O: 0, draw: 0 };
        this.updateScoreDisplay();
        this.saveScores();
        
        // Add score reset animation
        [this.elements.scoreX, this.elements.scoreO, this.elements.scoreDraw].forEach((score, index) => {
            setTimeout(() => {
                score.style.animation = 'pulse 0.5s ease-out';
                setTimeout(() => {
                    score.style.animation = '';
                }, 500);
            }, index * 100);
        });
    }

    updateDisplay() {
        if (!this.elements || !this.elements.currentPlayerText || !this.elements.turnIndicator) {
            return; // Elements not ready yet
        }
        
        this.elements.currentPlayerText.textContent = `Player ${this.currentPlayer}'s Turn`;
        this.elements.turnIndicator.style.background = this.currentPlayer === 'X' 
            ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
            : 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    }

    updateScoreDisplay() {
        if (!this.elements || !this.elements.scoreX || !this.elements.scoreO || !this.elements.scoreDraw) {
            return; // Elements not ready yet
        }
        
        this.elements.scoreX.textContent = this.scores.X;
        this.elements.scoreO.textContent = this.scores.O;
        this.elements.scoreDraw.textContent = this.scores.draw;
    }

    saveScores() {
        try {
            localStorage.setItem('ticTacToeScores', JSON.stringify(this.scores));
        } catch (e) {
            console.warn('Could not save scores to localStorage:', e);
        }
    }

    loadScores() {
        try {
            const savedScores = localStorage.getItem('ticTacToeScores');
            if (savedScores) {
                this.scores = { ...this.scores, ...JSON.parse(savedScores) };
            }
        } catch (e) {
            console.warn('Could not load scores from localStorage:', e);
        }
    }

    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }
}

// Performance optimizations
const addCSS = (css) => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
};

// Add confetti animation CSS dynamically
addCSS(`
    @keyframes confettiFall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
        }
    }
`);

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-out';
    
    // Initialize game
    window.game = new TicTacToeGame();
    
    // Fade in when loaded
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});

// Preload critical resources
const preloadResources = () => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap';
    link.as = 'style';
    document.head.appendChild(link);
};

// Initialize preloading
preloadResources();

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TicTacToeGame;
}