// Wait for the entire HTML document to be fully loaded before starting
document.addEventListener('DOMContentLoaded', () => {

    // --- GAME STATE ---
    let moves = 0;
    let timer = 0;
    let gameStarted = false;
    let timerInterval;
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchedPairs = 0;
    let totalPairs;

    // --- DOM ELEMENTS ---
    const gameBoard = document.getElementById('game-board');
    const movesCount = document.getElementById('moves-count');
    const timeElement = document.getElementById('time');
    const restartButton = document.getElementById('restart');
    const winMessage = document.getElementById('win-message');
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const playAgainButton = document.getElementById('play-again');

    // Card symbols (emojis)
    const cardSymbols = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🍐', '🥝', '🍑', '🥥', '🍋'];

    /* --------------------------
       INITIAL GAME SETUP
    -------------------------- */
    function initGame() {
        gameBoard.innerHTML = '';
        moves = 0;
        timer = 0;
        gameStarted = false;
        matchedPairs = 0;

        movesCount.textContent = moves;
        timeElement.textContent = timer;

        clearInterval(timerInterval);
        winMessage.style.display = 'none';

        resetBoard();
        setResponsiveLayout(true);

        updateDisplay();
    }

    /* --------------------------
       RESPONSIVE LAYOUT LOGIC
    -------------------------- */
    function setResponsiveLayout(forceRecreate = false) {
        const width = window.innerWidth;
        const previousSize = totalPairs;

        if (width <= 480) {
            totalPairs = 3;  // 6 cards
            gameBoard.className = "game-board mobile-layout";
        } else if (width <= 768) {
            totalPairs = 8;  // 16 cards
            gameBoard.className = "game-board tablet-layout";
        } else {
            totalPairs = 12; // 24 cards
            gameBoard.className = "game-board desktop-layout";
        }

        // Only rebuild if starting game OR size actually changed
        if (forceRecreate || previousSize !== totalPairs) {
            createCards();
        }
    }

    /* --------------------------
       CARD CREATION
    -------------------------- */
    function createCards() {
        gameBoard.innerHTML = '';
        let cards = [];

        const usablePairs = Math.min(totalPairs, cardSymbols.length);

        for (let i = 0; i < usablePairs; i++) {
            cards.push(cardSymbols[i]);
            cards.push(cardSymbols[i]);
        }

        cards = shuffleArray(cards);

        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = "card";
            card.tabIndex = 0;

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">?</div>
                    <div class="card-back">${symbol}</div>
                </div>
            `;

            card.addEventListener("click", flipCard);
            card.addEventListener("keypress", handleCardKeyPress);

            gameBoard.appendChild(card);
        });
    }

    /* Keyboard accessibility */
    function handleCardKeyPress(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            flipCard.call(event.currentTarget);
        }
    }

    /* Fisher-Yates Shuffle */
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /* --------------------------
       CARD FLIPPING
    -------------------------- */
    function flipCard() {
        if (lockBoard || this === firstCard || this.classList.contains("matched")) {
            return;
        }

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
        const symbol1 = firstCard.querySelector('.card-back').textContent;
        const symbol2 = secondCard.querySelector('.card-back').textContent;

        if (symbol1 === symbol2) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        firstCard.removeEventListener("click", flipCard);
        secondCard.removeEventListener("click", flipCard);

        firstCard.removeAttribute("tabindex");
        secondCard.removeAttribute("tabindex");

        matchedPairs++;

        if (matchedPairs === totalPairs) {
            endGame();
        } else {
            resetBoard();
        }
    }

    function unflipCards() {
        lockBoard = true;

        setTimeout(() => {
            firstCard?.classList.remove("flipped");
            secondCard?.classList.remove("flipped");
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        lockBoard = false;
        firstCard = null;
        secondCard = null;
    }

    /* --------------------------
       TIMER & GAME END
    -------------------------- */
    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            timeElement.textContent = timer;
        }, 1000);
    }

    function endGame() {
        clearInterval(timerInterval);

        setTimeout(() => {
            finalMoves.textContent = moves;
            finalTime.textContent = timer;
            winMessage.style.display = "flex";
            playAgainButton.focus();
        }, 500);
    }

    function updateDisplay() {
        movesCount.textContent = moves;
        timeElement.textContent = timer;
    }

    /* --------------------------
       WINDOW RESIZE HANDLING
    -------------------------- */

    // super-stable resize handling for responsive testers
    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setResponsiveLayout(false);
        }, 200);
    });

    /* --------------------------
       BUTTON EVENTS
    -------------------------- */
    restartButton.addEventListener("click", initGame);
    playAgainButton.addEventListener("click", () => {
        winMessage.style.display = "none";
        initGame();
    });

    restartButton.addEventListener("keypress", e => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            initGame();
        }
    });

    playAgainButton.addEventListener("keypress", e => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            winMessage.style.display = "none";
            initGame();
        }
    });

    /* --------------------------
       START GAME
    -------------------------- */
    initGame();

    window.addEventListener("error", (e) => {
        console.error("Game error:", e.error);
    });
});
