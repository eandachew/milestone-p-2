// STEP 1: Initialization and Setup
document.addEventListener('DOMContentLoaded', () => {
    // --- 1.1: Game State Variables ---
    let moves = 0;
    let timer = 0;
    let gameStarted = false;
    let timerInterval;
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchedPairs = 0;
    let totalPairs; // Determined dynamically based on screen size

    // --- 1.2: DOM Element References ---
    const gameBoard = document.getElementById('game-board');
    const movesCount = document.getElementById('moves-count');
    const timeElement = document.getElementById('time');
    const restartButton = document.getElementById('restart');
    const winMessage = document.getElementById('win-message');
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const playAgainButton = document.getElementById('play-again');

    // --- 1.3: Card Symbols ---
    const cardSymbols = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🍐', '🥝', '🍑', '🥥', '🍋'];


    // ----------------------------------------------------
    // STEP 2: Game Flow Management (Init, Start, End, Reset)
    // ----------------------------------------------------

    /**
     * Initializes a new game state and sets up the board.
     */
    function initGame() {
        // Reset all core variables
        gameBoard.innerHTML = '';
        moves = 0;
        timer = 0;
        gameStarted = false;
        matchedPairs = 0;
        clearInterval(timerInterval);
        winMessage.style.display = 'none';
        resetBoard();

        // Set the layout (size of the game) and create the cards
        setResponsiveLayout(true); 
        updateDisplay();
    }
    
    /**
     * Handles the completion of the game and shows the win message.
     */
    function endGame() {
        clearInterval(timerInterval);
        
        // Show win message after a short delay for final card animation
        setTimeout(() => {
            finalMoves.textContent = moves;
            finalTime.textContent = timer;
            winMessage.style.display = 'flex';
            playAgainButton.focus();
        }, 500);
    }

    /**
     * Starts the game timer, updating the display every second.
     */
    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            timeElement.textContent = timer;
        }, 1000);
    }

    /**
     * Updates the move count and time display elements.
     */
    function updateDisplay() {
        movesCount.textContent = moves;
        timeElement.textContent = timer;
    }


    // ----------------------------------------------------
    // STEP 3: Card Creation and Responsive Layout
    // ----------------------------------------------------

    /**
     * Determines the board size (number of pairs) and grid layout class
     * based on the current window width.
     */
    function setResponsiveLayout(forceCardCreation = false) {
        const width = window.innerWidth;
        const oldTotalPairs = totalPairs;

        // 3x2 grid for mobile
        if (width <= 480) { 
            totalPairs = 3; 
            gameBoard.className = 'game-board mobile-layout';
        // 4x4 grid for tablet
        } else if (width <= 768) { 
            totalPairs = 8;
            gameBoard.className = 'game-board tablet-layout';
        // 6x4 grid for desktop
        } else { 
            totalPairs = 12;
            gameBoard.className = 'game-board desktop-layout';
        }

        // Only create cards if this is a restart/init OR the layout size changed
        // We only rebuild the board if the number of pairs changes OR if explicitly forced (init)
        if (forceCardCreation || (oldTotalPairs && oldTotalPairs !== totalPairs)) {
            createCards();
        }
    }
    
    /**
     * Creates and shuffles the card elements on the board.
     */
    function createCards() {
        gameBoard.innerHTML = ''; 
        let cards = [];
        
        // Populate the cards array with two of each required symbol
        const pairsToCreate = Math.min(totalPairs, cardSymbols.length);
        for (let i = 0; i < pairsToCreate; i++) {
            cards.push(cardSymbols[i]);
            cards.push(cardSymbols[i]);
        }
        
        cards = shuffleArray(cards);
        
        // Generate the card DOM elements
        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('tabindex', '0');
            
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front" aria-hidden="true">?</div>
                    <div class="card-back" aria-hidden="true">${symbol}</div>
                </div>
            `;
            
            // Attach the click handler
            card.addEventListener('click', flipCard);
            
            gameBoard.appendChild(card);
        });
    }
    
    /**
     * Standard Fisher-Yates shuffle algorithm.
     */
    function shuffleArray(array) {
        const newArray = [...array]; 
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }


    // ----------------------------------------------------
    // STEP 4: Game Logic (Flipping and Matching)
    // ----------------------------------------------------

    /**
     * Flips a card, manages the game state, and starts the match check.
     */
    function flipCard() {
        // Guard clauses to prevent multiple clicks or clicking matched cards
        if (lockBoard || this === firstCard || this.classList.contains('matched')) {
            return;
        }

        // Start the timer on the very first click
        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }

        this.classList.add('flipped');

        if (!firstCard) {
            // This is the first card flipped
            firstCard = this;
            return;
        }

        // This is the second card flipped
        secondCard = this;
        moves++;
        movesCount.textContent = moves;
        
        checkForMatch();
    }

    /**
     * Checks if the symbols on the two flipped cards are identical.
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
     * Handles a successful match: marks cards, removes event listeners, and checks for game end.
     */
    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        // Stop the cards from being flipped again
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        matchedPairs++;
        
        if (matchedPairs === totalPairs) {
            endGame();
        } else {
            resetBoard();
        }
    }

    /**
     * Handles a non-match: locks the board temporarily and flips cards back.
     */
    function unflipCards() {
        lockBoard = true;
        
        // Wait 1 second, then flip both cards back
        setTimeout(() => {
            if (firstCard && secondCard) {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
            }
            resetBoard();
        }, 1000); 
    }

    /**
     * Clears the current card selection and unlocks the board.
     */
    function resetBoard() {
        lockBoard = false;
        firstCard = null;
        secondCard = null;
    }

    // --- Attach all major listeners ---
    restartButton.addEventListener('click', initGame);
    playAgainButton.addEventListener('click', initGame);

    // --- UPDATED RESPONSIVE HANDLER ---
    
    // Use a flag to track if we've already done the layout check on the current resize event cycle.
    // This is often more reliable than using a standard setTimeout debounce in iframe scenarios.
    let isResizing = false;
    
    const handleResize = () => {
        // Only run logic if the board size actually needs to change (i.e., we cross a breakpoint).
        // setResponsiveLayout handles the internal logic to prevent unnecessary card recreation.
        setResponsiveLayout();
        isResizing = false;
    }

    window.addEventListener('resize', () => {
        if (!isResizing) {
            isResizing = true;
            // Use requestAnimationFrame for smoother timing or a simple short timeout
            setTimeout(handleResize, 100); 
        }
    });

    // Start the game!
    initGame();
});