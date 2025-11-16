document.addEventListener('DOMContentLoaded', () => {
  let moves = 0, timer = 0, gameStarted = false, timerInterval;
  let firstCard = null, secondCard = null, lockBoard = false, matchedPairs = 0, totalPairs;

  const gameBoard = document.getElementById('game-board');
  const movesCount = document.getElementById('moves-count');
  const timeElement = document.getElementById('time');
  const restartButton = document.getElementById('restart');
  const winMessage = document.getElementById('win-message');
  const finalMoves = document.getElementById('final-moves');
  const finalTime = document.getElementById('final-time');
  const playAgainButton = document.getElementById('play-again');

  const cardSymbols = ['🍎','🍌','🍇','🍊','🍓','🍉','🍒','🍐','🥝','🍑','🥥','🍋'];

  // Game setup logic 
    function initGame() {
    gameBoard.innerHTML = '';
    moves = 0; timer = 0; gameStarted = false; matchedPairs = 0;
    movesCount.textContent = moves; timeElement.textContent = timer;
    clearInterval(timerInterval);

    if (window.innerWidth <= 480) {
      totalPairs = 6; gameBoard.className = 'game-board mobile-layout';
    } else if (window.innerWidth <= 768) {
      totalPairs = 8; gameBoard.className = 'game-board tablet-layout';
    } else {
      totalPairs = 12; gameBoard.className = 'game-board desktop-layout';
    }

    let cards = [];
    for (let i = 0; i < totalPairs; i++) {
      cards.push(cardSymbols[i]);
      cards.push(cardSymbols[i]);
    }
    cards = shuffleArray(cards);

    cards.forEach(symbol => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">?</div>
          <div class="card-back">${symbol}</div>
        </div>`;
      card.addEventListener('click', flipCard);
      gameBoard.appendChild(card);
    });
  }
// Utility Function
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  // Card Interaction Logic
    function flipCard() {
    if (lockBoard || this === firstCard || this.classList.contains('matched')) return;

    if (!gameStarted) { startTimer(); gameStarted = true; }

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

  function checkForMatch() {
    const isMatch = firstCard.querySelector('.card-back').textContent ===
                    secondCard.querySelector('.card-back').textContent;

    if (isMatch) {
      disableCards();
      matchedPairs++;
      if (matchedPairs === totalPairs) endGame();
    } else {
      unflipCards();
    }
  }

  function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
  }

  function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetBoard();
    }, 1000);
  }

  function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }
// Timer Logic
  function startTimer() {
    timerInterval = setInterval(() => {
      timer++;
      timeElement.textContent = timer;
    }, 1000);
  }
// Game end logic 
  function endGame() {
    clearInterval(timerInterval);
    setTimeout(() => {
      finalMoves.textContent = moves;
      finalTime.textContent = timer;
      winMessage.style.display = 'flex';
    }, 1000);
  }
  // Event listeners to restart.
    restartButton.addEventListener('click', initGame);
  playAgainButton.addEventListener('click', () => {
    winMessage.style.display = 'none';
    initGame();
  });

  initGame();
  window.addEventListener('resize', initGame);
});
