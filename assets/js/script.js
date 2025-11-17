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

  // Debug mode for responsive testing
  const isInIframe = window.self !== window.top;
  if (isInIframe) {
    console.log('Running in iframe - responsive tester detected');
    enableDebugMode();
  }

  // Enhanced game setup logic
  function initGame() {
    console.log('=== INIT GAME STARTED ===');
    console.log('Window width:', window.innerWidth);
    console.log('Game board element:', gameBoard);
    
    // Clear existing game state
    if (gameBoard) {
      gameBoard.innerHTML = '';
    } else {
      console.error('Game board element not found!');
      return;
    }
    
    moves = 0; 
    timer = 0; 
    gameStarted = false; 
    matchedPairs = 0;
    
    if (movesCount) movesCount.textContent = moves;
    if (timeElement) timeElement.textContent = timer;
    
    // Clear timer properly
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      console.log('Timer cleared');
    }

    // Enhanced layout detection with logging
    const previousLayout = gameBoard.className;
    if (window.innerWidth <= 480) {
      totalPairs = 6; 
      gameBoard.className = 'game-board mobile-layout';
      console.log('Mobile layout applied (≤480px)');
    } else if (window.innerWidth <= 768) {
      totalPairs = 8; 
      gameBoard.className = 'game-board tablet-layout';
      console.log('Tablet layout applied (≤768px)');
    } else {
      totalPairs = 12; 
      gameBoard.className = 'game-board desktop-layout';
      console.log('Desktop layout applied (>768px)');
    }

    console.log('Total pairs:', totalPairs);
    
    // Create and shuffle cards
    let cards = [];
    for (let i = 0; i < totalPairs; i++) {
      cards.push(cardSymbols[i]);
      cards.push(cardSymbols[i]);
    }
    cards = shuffleArray(cards);
    console.log('Shuffled cards:', cards);

    // Create card elements
    cards.forEach((symbol, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-index', index);
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">?</div>
          <div class="card-back">${symbol}</div>
        </div>`;
      gameBoard.appendChild(card);
    });

    // Enhanced event binding
    bindCardEvents();
    
    console.log('Cards created:', document.querySelectorAll('.card').length);
    console.log('=== INIT GAME COMPLETED ===');
  }

  // Utility Function
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Enhanced event binding for robust responsive testing
  function bindCardEvents() {
    const cards = document.querySelectorAll('.card');
    
    // Remove all existing event listeners by cloning
    cards.forEach(card => {
      const newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);
    });

    // Bind events to new cards
    const newCards = document.querySelectorAll('.card');
    newCards.forEach(card => {
      // Mouse events
      card.addEventListener('click', flipCard);
      
      // Touch events for mobile devices
      card.addEventListener('touchstart', function(e) {
        e.preventDefault();
        flipCard.call(this);
      }, { passive: false });
      
      // Keyboard accessibility
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          flipCard.call(this);
        }
      });
      
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Memory card');
    });

    console.log('Card events bound:', newCards.length, 'cards');
  }

  // Enhanced Card Interaction Logic
  function flipCard() {
    console.log('Card clicked:', this.getAttribute('data-index'));
    
    if (lockBoard || this === firstCard || this.classList.contains('matched')) {
      console.log('Card flip prevented - lockBoard:', lockBoard, 'isFirstCard:', this === firstCard, 'isMatched:', this.classList.contains('matched'));
      return;
    }

    if (!gameStarted) { 
      startTimer(); 
      gameStarted = true;
      console.log('Game started - timer initiated');
    }

    this.classList.add('flipped');
    console.log('Card flipped - symbol:', this.querySelector('.card-back').textContent);

    if (!firstCard) {
      firstCard = this;
      console.log('First card selected');
      return;
    }

    secondCard = this;
    moves++;
    if (movesCount) movesCount.textContent = moves;
    console.log('Second card selected - move count:', moves);
    
    checkForMatch();
  }

  function checkForMatch() {
    const firstSymbol = firstCard.querySelector('.card-back').textContent;
    const secondSymbol = secondCard.querySelector('.card-back').textContent;
    const isMatch = firstSymbol === secondSymbol;
    
    console.log('Match check:', firstSymbol, 'vs', secondSymbol, '- Match:', isMatch);

    if (isMatch) {
      disableCards();
      matchedPairs++;
      console.log('Match found! Total matches:', matchedPairs);
      if (matchedPairs === totalPairs) {
        endGame();
      }
    } else {
      unflipCards();
    }
  }

  function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    // Also remove touch events
    firstCard.removeEventListener('touchstart', flipCard);
    secondCard.removeEventListener('touchstart', flipCard);
    
    console.log('Cards disabled and marked as matched');
    resetBoard();
  }

  function unflipCards() {
    lockBoard = true;
    console.log('Board locked for unflipping');
    
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      console.log('Cards unflipped');
      resetBoard();
    }, 1000);
  }

  function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    console.log('Board reset');
  }

  // Enhanced Timer Logic
  function startTimer() {
    console.log('Timer started');
    timerInterval = setInterval(() => {
      timer++;
      if (timeElement) timeElement.textContent = timer;
      
      // Log every 10 seconds for debugging
      if (timer % 10 === 0) {
        console.log('Timer running:', timer, 'seconds');
      }
    }, 1000);
  }

  // Enhanced Game end logic
  function endGame() {
    console.log('Game completed! Moves:', moves, 'Time:', timer);
    
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      console.log('Timer stopped');
    }
    
    setTimeout(() => {
      if (finalMoves) finalMoves.textContent = moves;
      if (finalTime) finalTime.textContent = timer;
      if (winMessage) {
        winMessage.style.display = 'flex';
        console.log('Win message displayed');
      }
    }, 500);
  }

  // Enhanced resize handling with debounce
  let resizeTimeout;
  function handleResize() {
    const previousLayout = gameBoard.className;
    let newLayout;
    
    if (window.innerWidth <= 480) {
      newLayout = 'game-board mobile-layout';
    } else if (window.innerWidth <= 768) {
      newLayout = 'game-board tablet-layout';
    } else {
      newLayout = 'game-board desktop-layout';
    }
    
    // Only reinitialize if layout actually changed
    if (previousLayout !== newLayout) {
      console.log('Layout change detected:', previousLayout, '->', newLayout);
      console.log('Window width:', window.innerWidth);
      initGame();
    }
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 250);
  });

  // Fallback resize check for problematic testers
  let lastWidth = window.innerWidth;
  setInterval(() => {
    const currentWidth = window.innerWidth;
    if (Math.abs(currentWidth - lastWidth) > 50) { // Significant width change
      console.log('Significant width change detected:', lastWidth, '->', currentWidth);
      lastWidth = currentWidth;
      handleResize();
    }
  }, 500);

  // Event listeners with error handling
  if (restartButton) {
    restartButton.addEventListener('click', () => {
      console.log('Restart button clicked');
      initGame();
    });
    
    // Add touch support for restart button
    restartButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      initGame();
    });
  } else {
    console.error('Restart button not found');
  }

  if (playAgainButton) {
    playAgainButton.addEventListener('click', () => {
      console.log('Play again button clicked');
      if (winMessage) winMessage.style.display = 'none';
      initGame();
    });
    
    playAgainButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (winMessage) winMessage.style.display = 'none';
      initGame();
    });
  } else {
    console.error('Play again button not found');
  }

  // Debug mode for responsive testing
  function enableDebugMode() {
    console.log('Enhancing debug mode for responsive testing');
    
    // Add debug styles
    const debugStyle = document.createElement('style');
    debugStyle.textContent = `
      .debug-outline * { outline: 1px solid red; }
      .layout-info {
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        z-index: 10000;
        font-family: monospace;
        font-size: 12px;
        border-radius: 5px;
        pointer-events: none;
      }
      .card:hover {
        transform: scale(1.05);
        transition: transform 0.2s;
      }
    `;
    document.head.appendChild(debugStyle);
    
    // Show current layout info
    const layoutInfo = document.createElement('div');
    layoutInfo.className = 'layout-info';
    document.body.appendChild(layoutInfo);
    
    function updateLayoutInfo() {
      let layout, pairs;
      if (window.innerWidth <= 480) {
        layout = 'Mobile (≤480px)';
        pairs = 6;
      } else if (window.innerWidth <= 768) {
        layout = 'Tablet (≤768px)';
        pairs = 8;
      } else {
        layout = 'Desktop (>768px)';
        pairs = 12;
      }
      
      layoutInfo.textContent = `Width: ${window.innerWidth}px\nLayout: ${layout}\nPairs: ${pairs}\nIn Iframe: ${isInIframe}`;
    }
    
    window.addEventListener('resize', updateLayoutInfo);
    updateLayoutInfo();
    
    // Log initial state
    console.log('Debug mode enabled - running in iframe:', isInIframe);
    console.log('Initial window size:', window.innerWidth, 'x', window.innerHeight);
  }

  // Force initial layout check
  setTimeout(() => {
    console.log('Initial layout setup');
    initGame();
  }, 100);

  // Export for testing (if needed)
  window.memoryGame = {
    initGame,
    shuffleArray,
    flipCard,
    checkForMatch,
    startTimer,
    endGame,
    getState: () => ({ moves, timer, gameStarted, matchedPairs, totalPairs })
  };
});