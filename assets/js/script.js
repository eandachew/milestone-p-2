// ===============================
// MEMORY GAME SCRIPT (Fixed)
// ===============================

// DOM elements
const gameBoard = document.getElementById("game-board");
const movesLabel = document.getElementById("moves");
const timeLabel = document.getElementById("time");
const restartBtn = document.getElementById("restart-btn");

// Game variables
let totalPairs = 12;
let icons = ["🍎","🍌","🍇","🍒","🍑","🍉","🥝","🍍","🍓","🥥","🍐","🥭"];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let timer = null;
let time = 0;
let gameStarted = false;

// ===============================
// DETECT SCREEN SIZE SAFELY
// ===============================
function detectScreenSize() {
    let width = window.innerWidth;

    if (width <= 480) {
        totalPairs = 6;
        gameBoard.className = "game-board mobile-layout";
    } 
    else if (width <= 768) {
        totalPairs = 8;
        gameBoard.className = "game-board tablet-layout";
    } 
    else {
        totalPairs = 12;
        gameBoard.className = "game-board desktop-layout";
    }
}

// ===============================
// START GAME
// ===============================
function startGame() {
    detectScreenSize();      // apply correct layout
    buildBoard();            // generate all cards
    resetStats();            // reset stats & timer
}

// ===============================
// BUILD CARD BOARD
// ===============================
function buildBoard() {
    gameBoard.innerHTML = "";  // clear previous game

    let selectedIcons = icons.slice(0, totalPairs);
    let cardSet = [...selectedIcons, ...selectedIcons]; // duplicate for pairs

    // Shuffle
    cardSet.sort(() => Math.random() - 0.5);

    // Create cards
    cardSet.forEach(icon => {
        let card = document.createElement("div");
        card.className = "card";
        card.setAttribute("tabindex", "0");

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${icon}</div>
            </div>
        `;

        card.addEventListener("click", () => flipCard(card));
        card.addEventListener("keypress", (e) => {
            if (e.key === "Enter") flipCard(card);
        });

        gameBoard.appendChild(card);
    });
}

// ===============================
// RESET STATS
// ===============================
function resetStats() {
    moves = 0;
    time = 0;
    gameStarted = false;

    movesLabel.textContent = moves;
    timeLabel.textContent = time + "s";

    clearInterval(timer);
}

// ===============================
// FLIP CARD LOGIC
// ===============================
function flipCard(card) {
    if (lockBoard) return;
    if (card === firstCard) return;

    if (!gameStarted) startTimer();

    card.classList.add("flipped");

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    lockBoard = true;
    moves++;
    movesLabel.textContent = moves;

    checkMatch();
}

// ===============================
// CHECK MATCH
// ===============================
function checkMatch() {
    const firstIcon = firstCard.querySelector(".card-back").textContent;
    const secondIcon = secondCard.querySelector(".card-back").textContent;

    if (firstIcon === secondIcon) {
        disableCards();
    } else {
        unflipCards();
    }
}

// ===============================
// MATCHED — LEAVE FLIPPED
// ===============================
function disableCards() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    checkWin();
}

// ===============================
// NOT MATCHED — FLIP BACK
// ===============================
function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");

        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }, 800);
}

// ===============================
// TIMER
// ===============================
function startTimer() {
    gameStarted = true;

    timer = setInterval(() => {
        time++;
        timeLabel.textContent = time + "s";
    }, 1000);
}

// ===============================
// CHECK WIN
// ===============================
function checkWin() {
    const flippedCount = document.querySelectorAll(".flipped").length;

    if (flippedCount === totalPairs * 2) {
        clearInterval(timer);
    }
}

// Restart game
restartBtn.addEventListener("click", startGame);

// Start on load
window.addEventListener("load", startGame);
