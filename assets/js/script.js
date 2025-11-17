document.addEventListener('DOMContentLoaded', () => {

    // --------------------
    // GAME STATE
    // --------------------
    let moves = 0;
    let timer = 0;
    let timerInterval;
    let gameStarted = false;

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchedPairs = 0;
    let totalPairs = 12; // default

    // --------------------
    // DOM ELEMENTS
    // --------------------
    const gameBoard = document.getElementById('game-board');
    const movesCount = document.getElementById('moves-count');
    const timeElement = document.getElementById('time');
    const restartButton = document.getElementById('restart');

    const winMessage = document.getElementById('win-message');
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const playAgainButton = document.getElementById('play-again');

    // Card symbols (12 possible pairs)
    const cardSymbols = [
        '🍎','🍌','🍇','🍊','🍓','🍉',
        '🍒','🍐','🥝','🍑','🥥','🍋'
    ];

    // --------------------
    // INITIALIZE GAME
    // --------------------
    function initGame() {
        // reset game state
        moves = 0;
        timer = 0;
        gameStarted = false;
        matchedPairs = 0;

        movesCount.textContent = moves;
        timeElement.textContent = timer;

        clearInterval(timerInterval);
        gameBoard.innerHTML = '';
        winMessage.style.display = "none";

        // Determine number of pairs based on screen size
        if (window.innerWidth <= 480) {
            totalPairs = 6;
            gameBoard.className = "game-board mobile-layout";
        }
        else if (window.innerWidth <= 768) {
            totalPairs = 8;
            gameBoard.className = "game-board tablet-layout";
        }
        else {
            totalPairs = 12;
            gameBoard.className = "game-board desktop-layout";
        }

        createCards();
    }

    // --------------------
    // CREATE CARDS
    // --------------------
    function createCards() {
        let cards = [];

        // Select N pairs based on screen size
        for (let i = 0; i < totalPairs; i++) {
            cards.push(cardSymbols[i]);
            cards.push(cardSymbols[i]);
        }

        // Shuffle
        cards = shuffle(cards);

        // Build the card HTML
        cards.forEach(symbol => {
            const card = document.createElement('div');
            card.className = "card";
            card.setAttribute("tabindex", "0");

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">?</div>
                    <div class="card-back">${symbol}</div>
                </div>
            `;

            card.addEventListener('click', flipCard);
            gameBoard.appendChild(card);
        });
    }

    // --------------------
    // SHUFFLE FUNCTION
    // --------------------
    function shuffle(array) {
        let arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // --------------------
    // CARD FLIP LOGIC
    // --------------------
    function flipCard() {
        if (lockBoard || this === firstCard) return;

        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }

        this.classList.add("flipped");

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        moves++;
        movesCount.textContent = moves;

        checkForMatch();
    }

    function checkForMatch() {
        const a = firstCard.querySelector('.card-back').textContent;
        const b = secondCard.querySelector('.card-back').textContent;

        if (a === b) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        matchedPairs++;

        resetFlip();

        if (matchedPairs === totalPairs) {
            endGame();
        }
    }

    function unflipCards() {
        lockBoard = true;

        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");

            resetFlip();
        }, 1000);
    }

    function resetFlip() {
        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }

    // --------------------
    // TIMER
    // --------------------
    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            timeElement.textContent = timer;
        }, 1000);
    }

    // --------------------
    // END GAME
    // --------------------
    function endGame() {
        clearInterval(timerInterval);

        finalMoves.textContent = moves;
        finalTime.textContent = timer;

        winMessage.style.display = "flex";
    }

    // --------------------
    // BUTTON EVENTS
    // --------------------
    restartButton.addEventListener('click', initGame);

    playAgainButton.addEventListener('click', () => {
        winMessage.style.display = 'none';
        initGame();
    });

    // Rebuild game when window resized
    window.addEventListener('resize', () => {
        initGame();
    });

    // Start game first time
    initGame();

});
