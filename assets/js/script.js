document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Starting game initialization...');
    
    let moves = 0, timer = 0, gameStarted = false, timerInterval;
    let firstCard = null, secondCard = null, lockBoard = false, matchedPairs = 0, totalPairs;

    // Get DOM elements
    const gameBoard = document.getElementById('game-board');
    const movesCount = document.getElementById('moves-count');
    const timeElement = document.getElementById('time');
    const restartButton = document.getElementById('restart');
    const winMessage = document.getElementById('win-message');
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const playAgainButton = document.getElementById('play-again');

    // Validate critical elements
    if (!gameBoard) {
        console.error('CRITICAL ERROR: game-board element not found!');
        return;
    }

    console.log('Game board found:', gameBoard);

    const cardSymbols = ['🍎','🍌','🍇','🍊','🍓','🍉','🍒','🍐','🥝','🍑','🥥','🍋'];

    // Initialize game
    function initGame() {
        console.log('Initializing game...');
        
        // Reset game state
        gameBoard.innerHTML = '';
        moves = 0;
        timer = 0;
        gameStarted = false;
        matchedPairs = 0;
        firstCard = null;
        secondCard = null;
        lockBoard = false;

        // Update UI
        if (movesCount) movesCount.textContent = moves;
        if (timeElement) timeElement.textContent = timer;

        // Clear timer
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        // Hide win message
        if (winMessage) {
            winMessage.style.display = 'none';
        }

        // Set responsive layout
        setLayout();
        
        // Create and display cards
        createCards();
        
        console.log('Game initialized successfully');
        console.log('Current layout:', gameBoard.className);
        console.log('Total pairs:', totalPairs);
    }

    function setLayout() {
        const width = window.innerWidth;
        console.log('Window width:', width);

        if (width <= 480) {
            totalPairs = 6;
            gameBoard.className = 'game-board mobile-layout';
        } else if (width <= 768) {
            totalPairs = 8;
            gameBoard.className = 'game-board tablet-layout';
        } else {
            totalPairs = 12;
            gameBoard.className = 'game-board desktop-layout';
        }
    }

    function createCards() {
        console.log('Creating cards for', totalPairs, 'pairs');
        
        // Create card pairs
        let cards = [];
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
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">?</div>
                    <div class="card-back">${symbol}</div>
                </div>
            `;
            
            // Add click event
            card.addEventListener('click', flipCard);
            gameBoard.appendChild(card);
        });

        console.log('Created', gameBoard.children.length, 'cards');
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function flipCard() {
        // Prevent invalid clicks
        if (lockBoard || this === firstCard || this.classList.contains('matched')) {
            return;
        }

        // Start timer on first click
        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }

        // Flip card
        this.classList.add('flipped');

        // First card selection
        if (!firstCard) {
            firstCard = this;
            return;
        }

        // Second card selection
        secondCard = this;
        moves++;
        if (movesCount) movesCount.textContent = moves;
        
        lockBoard = true;
        checkForMatch();
    }

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

    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        matchedPairs++;
        
        // Check for win
        if (matchedPairs === totalPairs) {
            endGame();
        }
        
        resetBoard();
    }

    function unflipCards() {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            if (timeElement) timeElement.textContent = timer;
        }, 1000);
    }

    function endGame() {
        clearInterval(timerInterval);
        
        setTimeout(() => {
            if (finalMoves) finalMoves.textContent = moves;
            if (finalTime) finalTime.textContent = timer;
            if (winMessage) winMessage.style.display = 'flex';
        }, 500);
    }

    // Event listeners
    if (restartButton) {
        restartButton.addEventListener('click', initGame);
    }

    if (playAgainButton) {
        playAgainButton.addEventListener('click', () => {
            if (winMessage) winMessage.style.display = 'none';
            initGame();
        });
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initGame, 250);
    });

    // Initial game start
    console.log('Starting game...');
    initGame();
});