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

    // --- DOM ELEMENTS ---
    const gameBoard = document.getElementById('game-board');
    const movesCount = document.getElementById('moves-count');
    const timeElement = document.getElementById('time');
    const restartButton = document.getElementById('restart');
    const winMessage = document.getElementById('win-message');
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const playAgainButton = document.getElementById('play-again');

    // --- CARDS ---
    const cards = Array.from(document.querySelectorAll('.card'));

    // Add event listeners for each card
    cards.forEach(card => {
        card.addEventListener('click', flipCard);
        card.addEventListener('keypress', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                flipCard.call(card);
            }
        });
    });

    // --- FLIP CARD FUNCTION ---
    function flipCard() {
        if (lockBoard || this === firstCard || this.classList.contains('matched')) return;

        if (!gameStarted) startTimer();

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

    // --- CHECK FOR MATCH ---
    function checkForMatch() {
        const symbol1 = firstCard.querySelector('.card-back').textContent;
        const symbol2 = secondCard.querySelector('.card-back').textContent;

        if (symbol1 === symbol2) {
            // Match found
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            firstCard.removeEventListener('click', flipCard);
            secondCard.removeEventListener('click', flipCard);

            matchedPairs++;
            if (matchedPairs === cards.length / 2) endGame();

            resetBoard();
        } else {
            // Not a match, flip back after delay
            lockBoard = true;
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                resetBoard();
            }, 1000);
        }
    }

    // --- RESET BOARD SELECTION ---
    function resetBoard() {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
    }

    // --- START TIMER ---
    function startTimer() {
        gameStarted = true;
        timerInterval = setInterval(() => {
            timer++;
            timeElement.textContent = timer;
        }, 1000);
    }

    // --- END GAME ---
    function endGame() {
        clearInterval(timerInterval);
        finalMoves.textContent = moves;
        finalTime.textContent = timer;
        winMessage.style.display = 'flex';
        playAgainButton.focus();
    }

    // --- RESET / RESTART GAME ---
    function resetGame() {
        moves = 0;
        timer = 0;
        gameStarted = false;
        matchedPairs = 0;
        movesCount.textContent = moves;
        timeElement.textContent = timer;

        cards.forEach(card => {
            card.classList.remove('flipped', 'matched');
            card.addEventListener('click', flipCard);
        });

        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }

    // --- BUTTON EVENTS ---
    restartButton.addEventListener('click', resetGame);
    playAgainButton.addEventListener('click', () => {
        winMessage.style.display = 'none';
        resetGame();
    });

    restartButton.addEventListener('keypress', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            resetGame();
        }
    });

    playAgainButton.addEventListener('keypress', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            winMessage.style.display = 'none';
            resetGame();
        }
    });

    // --- INITIALIZATION ---
    resetGame();
});
