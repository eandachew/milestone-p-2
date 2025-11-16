 document.addEventListener('DOMContentLoaded', () => {
            // Game state variables
            let moves = 0;
            let timer = 0;
            let gameStarted = false;
            let timerInterval;
            let firstCard = null;
            let secondCard = null;
            let lockBoard = false;
            let matchedPairs = 0;
            let totalPairs; // Defined by screen size

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
                
                // Reset board state for a new turn
                resetBoard();

                // Set responsive layout and create cards
                setResponsiveLayout(true); 

                // Update display
                updateDisplay();
            }

            /**
             * Set responsive layout based on screen width and set totalPairs count.
             * @param {boolean} forceCardCreation - Forces card recreation even if totalPairs hasn't changed.
             */
            function setResponsiveLayout(forceCardCreation = false) {
                const width = window.innerWidth;
                const oldTotalPairs = totalPairs;

                if (width <= 480) {
                    // Mobile layout - 3x2 grid (3 pairs, 6 cards)
                    totalPairs = 3; 
                    gameBoard.className = 'game-board mobile-layout';
                } else if (width <= 768) {
                    // Tablet layout - 4x4 grid (8 pairs, 16 cards)
                    totalPairs = 8;
                    gameBoard.className = 'game-board tablet-layout';
                } else {
                    // Desktop layout - 6x4 grid (12 pairs, 24 cards)
                    totalPairs = 12;
                    gameBoard.className = 'game-board desktop-layout';
                }

                // If the layout size changed OR we explicitly forced it (during init/restart), recreate cards.
                if (forceCardCreation || (oldTotalPairs && oldTotalPairs !== totalPairs)) {
                    createCards();
                }
            }

            /**
             * Create and shuffle cards
             */
            function createCards() {
                // Remove existing cards first 
                gameBoard.innerHTML = ''; 
                let cards = [];
                
                // Safety check: ensure we don't try to create more pairs than we have symbols
                const pairsToCreate = Math.min(totalPairs, cardSymbols.length);
                
                // Create pairs of cards
                for (let i = 0; i < pairsToCreate; i++) {
                    cards.push(cardSymbols[i]);
                    cards.push(cardSymbols[i]);
                }
                
                // Shuffle cards (Fisher-Yates)
                cards = shuffleArray(cards);
                
                // Create card elements
                cards.forEach((symbol, index) => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.setAttribute('data-index', index);
                    card.setAttribute('aria-label', `Card ${index + 1}`);
                    
                    card.innerHTML = `
                        <div class="card-inner">
                            <div class="card-front" aria-hidden="true">?</div>
                            <div class="card-back" aria-hidden="true">${symbol}</div>
                        </div>
                    `;
                    
                    card.addEventListener('click', flipCard);
                    card.addEventListener('keypress', handleCardKeyPress);
                    card.setAttribute('tabindex', '0');
                    
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
                const newArray = [...array]; 
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
                if (lockBoard || this === firstCard || this.classList.contains('matched')) {
                    return;
                }

                if (!gameStarted) {
                    startTimer();
                    gameStarted = true;
                }

                this.classList.add('flipped');

                if (!firstCard) {
                    firstCard = this;
                    return;
                }

                secondCard = this;
                moves++;
                movesCount.textContent = moves;
                
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
                
                firstCard.removeEventListener('click', flipCard);
                firstCard.removeEventListener('keypress', handleCardKeyPress);
                secondCard.removeEventListener('click', flipCard);
                secondCard.removeEventListener('keypress', handleCardKeyPress);
                
                firstCard.removeAttribute('tabindex');
                secondCard.removeAttribute('tabindex');
                
                matchedPairs++;
                
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
                    }
                    resetBoard();
                }, 1000);
            }

            /**
             * Reset board state after each turn
             */
            function resetBoard() {
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
                clearInterval(timerInterval);
                
                setTimeout(() => {
                    finalMoves.textContent = moves;
                    finalTime.textContent = timer;
                    winMessage.style.display = 'flex';
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
                // If the game is running, only update CSS classes.
                if (gameStarted && matchedPairs < totalPairs) {
                    setResponsiveLayout(false); 
                } else {
                    // If the game hasn't started or is finished, reinitialize (which recalculates totalPairs and creates new cards).
                    initGame();
                }
            }

            // Event Listeners
            restartButton.addEventListener('click', initGame);
            playAgainButton.addEventListener('click', () => {
                winMessage.style.display = 'none';
                initGame();
            });

            // Keyboard support for buttons
            restartButton.addEventListener('keypress', (event) => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); initGame(); }
            });

            playAgainButton.addEventListener('keypress', (event) => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); winMessage.style.display = 'none'; initGame(); }
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
            });
        });