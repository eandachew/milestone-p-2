document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - starting game initialization');
    
    let moves = 0;
    let timer = 0;
    let gameStarted = false;
    let timerInterval;
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchedPairs = 0;
    let totalPairs;

    // Get DOM elements
    const gameBoard = document.getElementById('game-board');
    const movesCount = document.getElementById('moves-count');
    const timeElement = document.getElementById('time');
    const restartButton = document.getElementById('restart');
    const winMessage = document.getElementById('win-message');
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const playAgainButton = document.getElementById('play-again');

    // Debug: Check if elements exist
    console.log('Game board element:', gameBoard);
    console.log('Moves count element:', movesCount);
    console.log('Time element:', timeElement);

    if (!gameBoard) {
        console.error('GAME BOARD ELEMENT NOT FOUND! Check your HTML');
        showError('Game board element missing!');
        return;
    }

    const cardSymbols = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🍐', '🥝', '🍑', '🥥', '🍋'];

    // Initialize the game
    function initGame() {
        console.log('=== INITIALIZING GAME ===');
        
        // Clear the game board
        gameBoard.innerHTML = '';
        
        // Reset game state
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

        // Clear any existing timer
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
        
        // Create cards
        createCards();
        
        console.log('Game initialized with ' + totalPairs + ' pairs');
        console.log('Game board class: ' + gameBoard.className);
    }

    function setLayout() {
        const width = window.innerWidth;
        console.log('Window width: ' + width + 'px');

        if (width <= 480) {
            totalPairs = 6;
            gameBoard.className = 'game-board mobile-layout';
            console.log('Mobile layout: 3 columns, 6 pairs');
        } else if (width <= 768) {
            totalPairs = 8;
            gameBoard.className = 'game-board tablet-layout';
            console.log('Tablet layout: 4 columns, 8 pairs');
        } else {
            totalPairs = 12;
            gameBoard.className = 'game-board desktop-layout';
            console.log('Desktop layout: 6 columns, 12 pairs');
        }
    }

    function createCards() {
        console.log('Creating ' + totalPairs + ' pairs of cards');
        
        // Create array of card pairs
        let cards = [];
        for (let i = 0; i < totalPairs; i++) {
            cards.push(cardSymbols[i]);
            cards.push(cardSymbols[i]);
        }

        // Shuffle the cards
        cards = shuffleArray(cards);
        console.log('Shuffled cards: ', cards);

        // Create card elements and add to game board
        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-index', index);
            
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">?</div>
                    <div class="card-back">${symbol}</div>
                </div>
            `;
            
            // Add click event listener
            card.addEventListener('click', flipCard);
            
            // Add to game board
            gameBoard.appendChild(card);
        });

        console.log('Created ' + gameBoard.children.length + ' cards on the board');
        
        // Force a reflow to ensure CSS is applied
        gameBoard.style.display = 'none';
        gameBoard.offsetHeight; // Trigger reflow
        gameBoard.style.display = 'grid';
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function flipCard() {
        console.log('Card clicked');
        
        if (lockBoard) {
            console.log('Board locked, ignoring click');
            return;
        }
        if (this === firstCard) {
            console.log('Same card clicked twice, ignoring');
            return;
        }
        if (this.classList.contains('matched')) {
            console.log('Card already matched, ignoring');
            return;
        }

        // Start timer on first card flip
        if (!gameStarted) {
            console.log('First move - starting timer');
            startTimer();
            gameStarted = true;
        }

        // Flip the card
        this.classList.add('flipped');
        console.log('Card flipped: ' + this.querySelector('.card-back').textContent);

        // If no first card, set this as first card
        if (!firstCard) {
            firstCard = this;
            console.log('First card selected');
            return;
        }

        // Otherwise, this is the second card
        secondCard = this;
        moves++;
        console.log('Second card selected - move count: ' + moves);
        
        if (movesCount) {
            movesCount.textContent = moves;
        }
        
        lockBoard = true;
        checkForMatch();
    }

    function checkForMatch() {
        console.log('Checking for match...');
        
        const isMatch = firstCard.querySelector('.card-back').textContent === 
                       secondCard.querySelector('.card-back').textContent;

        console.log('Match result: ' + isMatch);

        if (isMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        console.log('Cards matched!');
        
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        matchedPairs++;
        console.log('Matched pairs: ' + matchedPairs + '/' + totalPairs);
        
        if (matchedPairs === totalPairs) {
            console.log('All pairs matched! Game over.');
            endGame();
        }
        
        resetBoard();
    }

    function unflipCards() {
        console.log('Cards do not match, unflipping...');
        
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
        console.log('Board reset');
    }

    function startTimer() {
        console.log('Timer started');
        timerInterval = setInterval(() => {
            timer++;
            if (timeElement) {
                timeElement.textContent = timer;
            }
        }, 1000);
    }

    function endGame() {
        console.log('Ending game...');
        clearInterval(timerInterval);
        
        setTimeout(() => {
            if (finalMoves) finalMoves.textContent = moves;
            if (finalTime) finalTime.textContent = timer;
            if (winMessage) {
                winMessage.style.display = 'flex';
                console.log('Win message displayed');
            }
        }, 500);
    }

    // Event listeners
    if (restartButton) {
        restartButton.addEventListener('click', function() {
            console.log('Restart button clicked');
            initGame();
        });
    } else {
        console.error('Restart button not found');
    }

    if (playAgainButton) {
        playAgainButton.addEventListener('click', function() {
            console.log('Play again button clicked');
            if (winMessage) winMessage.style.display = 'none';
            initGame();
        });
    } else {
        console.error('Play again button not found');
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        console.log('Window resized');
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            console.log('Resize complete - reinitializing game');
            initGame();
        }, 250);
    });

    // Add error display function
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #e74c3c;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
            font-family: Arial, sans-serif;
            max-width: 80%;
        `;
        errorDiv.innerHTML = `
            <h3>🚨 Game Error</h3>
            <p>${message}</p>
            <p style="font-size: 12px; margin-top: 10px;">Check browser console (F12) for details</p>
        `;
        document.body.appendChild(errorDiv);
    }

    // Initialize the game
    console.log('Starting game initialization...');
    initGame();
    console.log('Game should be running now!');
});