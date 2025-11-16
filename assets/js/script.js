// Global variables (needed for resetBoard function)
let hasFlippedCard = false;
let lockBoard = false;
let firstCard = null;
let secondCard = null;

document.addEventListener('DOMContentLoaded', () => {
    // Game state variables
    let moves = 0;
    let timer = 0;
    let gameStarted = false;
    let timerInterval;
    let matchedPairs = 0;
    let totalPairs;

    // DOM elements
    const gameBoard = document.getElementById('game-board');
    const movesCount = document.getElementById('moves-count');
    const timeElement = document.getElementById('time');
    const restartButton = document.getElementById('restart');
    const winMessage = document.getElementById('win-message');
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const playAgainButton = document.getElementById('play-again');

    // Card symbols - using emojis for better compatibility
    const cardSymbols = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🍐', '🥝', '🍑', '🥥', '🍋'];

    /**
     * Initialize the game
     */
    function initGame() {
        // Reset game state
        gameBoard.innerHTML = '';
        moves = 0;
        timer = 0;
        gameStarted = false;
        matchedPairs = 0;
        movesCount.textContent = moves;
        timeElement.textContent = timer;
        
        // Clear any existing timer
        clearInterval(timerInterval);
        
        // Hide win message if visible
        winMessage.style.display = 'none';
        
        // Reset board state
        resetBoard();

        // Set responsive layout based on screen size
        setResponsiveLayout();

        // Create and shuffle cards
        createCards();

        // Update display
        updateDisplay();
    }

    /**
     * Set responsive layout based on screen width
     */
    function setResponsiveLayout() {
        const width = window.innerWidth;
        
        if (width <= 480) {
            // Mobile layout - 2x3 grid (6 cards)
            totalPairs = 6;
            gameBoard.className = 'game-board mobile-layout';
        } else if (width <= 768) {
            // Tablet layout - 4x4 grid (8 pairs)
            totalPairs = 8;
            gameBoard.className = 'game-board tablet-layout';
        } else {
            // Desktop layout - 6x4 grid (12 pairs)
            totalPairs = 12;
            gameBoard.className = 'game-board desktop-layout';
        }
        
        console.log(`Screen width: ${width}px, Layout: ${gameBoard.className}, Pairs: ${totalPairs}`);
    }

    /**
     * Create and shuffle cards
     */
    function createCards() {
        let cards = [];
        
        // Create pairs of cards
        for (let i = 0; i < totalPairs; i++) {
            cards.push(cardSymbols[i]);
            cards.push(cardSymbols[i]);
        }
        
        // Shuffle cards
        cards = shuffleArray(cards);
        
        // Create card elements
        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-index', index);
            card.setAttribute('aria-label', `Card ${index + 1}`);
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0'); // Make cards focusable for accessibility
            
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front" aria-hidden="true">?</div>
                    <div class="card-back" aria-hidden="true">${symbol}</div>
                </div>
            `;
            
            card.addEventListener('click', flipCard);
            card.addEventListener('keypress', handleCardKeyPress);
            
            gameBoard.appendChild(card);
        });
    }

    /**
     * Handle keyboard events for accessibility
     */
    function handleCardKeyPress(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            flipCard.call(event.currentTarget);
        }
    }

    /**
     * Fisher-Yates shuffle algorithm
     */
    function shuffleArray(array) {
        const newArray = [...array]; // Create a copy to avoid mutating original
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    /**
     * Flip card when clicked
     */
    function flipCard() {
        // Prevent flipping if board is locked, card is already flipped/matched, or same card clicked twice
        if (lockBoard || this === firstCard || this.classList.contains('matched')) {
            return;
        }

        // Start timer on first card flip
        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }

        // Flip the card
        this.classList.add('flipped');

        // Store first card or check for match
        if (!firstCard) {
            firstCard = this;
            return;
        }

        // Second card flipped
        secondCard = this;
        moves++;
        movesCount.textContent = moves;
        
        // Check if cards match
        checkForMatch();
    }

    /**
     * Check if the two flipped cards match
     */
    function checkForMatch() {
        const firstSymbol = firstCard.querySelector('.card-back').textContent;
        const secondSymbol = secondCard.querySelector('.card-back').textContent;
        const isMatch = firstSymbol === secondSymbol;

        if (isMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    /**
     * Disable matched cards
     */
    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        // Remove event listeners from matched cards
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('keypress', handleCardKeyPress);
        secondCard.removeEventListener('click', flipCard);
        firstCard.removeEventListener('keypress', handleCardKeyPress);
        
        // Remove tabindex from matched cards
        firstCard.removeAttribute('tabindex');
        secondCard.removeAttribute('tabindex');
        
        matchedPairs++;
        
        // Check if game is won
        if (matchedPairs === totalPairs) {
            endGame();
        } else {
            resetBoard();
        }
    }

    /**
     * Unflip non-matching cards
     */
    function unflipCards() {
        lockBoard = true;
        
        setTimeout(() => {
            if (firstCard && secondCard) {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                resetBoard();
            }
        }, 1000);
    }

    /**
     * Reset board state after each turn
     */
    function resetBoard() {
        hasFlippedCard = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;
    }

    /**
     * Start game timer
     */
    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            timeElement.textContent = timer;
        }, 1000);
    }

    /**
     * End game when all pairs are matched
     */
    function endGame() {
        // Stop timer
        clearInterval(timerInterval);
        
        // Show win message after a short delay
        setTimeout(() => {
            finalMoves.textContent = moves;
            finalTime.textContent = timer;
            winMessage.style.display = 'flex';
            
            // Add focus to play again button for accessibility
            playAgainButton.focus();
        }, 500);
    }

    /**
     * Update game display
     */
    function updateDisplay() {
        movesCount.textContent = moves;
        timeElement.textContent = timer;
    }

    /**
     * Handle window resize for responsive layout
     */
    function handleResize() {
        // Only reinitialize if game hasn't started or is finished
        if (!gameStarted || matchedPairs === totalPairs) {
            initGame();
        } else {
            // Just update the layout without resetting game state
            const currentMatched = matchedPairs;
            const currentMoves = moves;
            const currentTimer = timer;
            const currentGameStarted = gameStarted;
            
            setResponsiveLayout();
            createCards();
            
            // Restore game state
            matchedPairs = currentMatched;
            moves = currentMoves;
            timer = currentTimer;
            gameStarted = currentGameStarted;
            movesCount.textContent = moves;
            timeElement.textContent = timer;
        }
    }

    // Event Listeners

    // Restart game button
    restartButton.addEventListener('click', () => {
        initGame();
    });

    // Play again button
    playAgainButton.addEventListener('click', () => {
        winMessage.style.display = 'none';
        initGame();
    });

    // Keyboard support for buttons
    restartButton.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            initGame();
        }
    });

    playAgainButton.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            winMessage.style.display = 'none';
            initGame();
        }
    });

    // Window resize handler with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });

    // Initialize game when page loads
    initGame();

    // Add global error handling
    window.addEventListener('error', (event) => {
        console.error('Game error:', event.error);
        // You could show a user-friendly error message here
    });

    // Prevent context menu on cards for better mobile experience
    gameBoard.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
});