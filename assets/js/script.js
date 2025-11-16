document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("game-board");
    const movesCount = document.getElementById("moves-count");
    const timeElement = document.getElementById("time");
    const restartButton = document.getElementById("restart");
    const winMessage = document.getElementById("win-message");
    const finalMoves = document.getElementById("final-moves");
    const finalTime = document.getElementById("final-time");
    const playAgainButton = document.getElementById("play-again");

    const cardSymbols = ["🍎","🍌","🍇","🍊","🍓","🍉","🍒","🍐","🥝","🍑","🥥","🍋"];
    let moves=0, timer=0, gameStarted=false, timerInterval, firstCard=null, secondCard=null, lockBoard=false, matchedPairs=0;

    function initGame(){
        gameBoard.innerHTML="";
        moves=0; timer=0; gameStarted=false; matchedPairs=0;
        movesCount.textContent=moves; timeElement.textContent=timer;
        clearInterval(timerInterval); winMessage.style.display="none";
        firstCard=null; secondCard=null; lockBoard=false;
        createCards();
    }

    function createCards(){
        let cards=[];
        const pairs = 12;
        for(let i=0;i<pairs;i++){ cards.push(cardSymbols[i]); cards.push(cardSymbols[i]); }
        cards=shuffle(cards);
        cards.forEach(symbol=>{
            const card=document.createElement("div");
            card.className="card"; card.tabIndex=0;
            card.innerHTML=`<div class="card-inner"><div class="card-front">?</div><div class="card-back">${symbol}</div></div>`;
            card.addEventListener("click",flipCard);
            card.addEventListener("keypress",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();flipCard.call(card);}});
            gameBoard.appendChild(card);
        });
    }

    function shuffle(array){const arr=[...array];for(let i=arr.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}

    function flipCard(){
        if(lockBoard||this===firstCard||this.classList.contains("matched")) return;
        if(!gameStarted){startTimer(); gameStarted=true;}
        this.classList.add("flipped");
        if(!firstCard){firstCard=this; return;}
        secondCard=this; moves++; movesCount.textContent=moves; checkMatch();
    }

    function checkMatch(){
        const sym1=firstCard.querySelector(".card-back").textContent;
        const sym2=secondCard.querySelector(".card-back").textContent;
        if(sym1===sym2) disableCards(); else unflipCards();
    }

    function disableCards(){
        firstCard.classList.add("matched"); secondCard.classList.add("matched");
        firstCard.removeEventListener("click",flipCard);
        secondCard.removeEventListener("click",flipCard);
        firstCard.removeAttribute("tabindex"); secondCard.removeAttribute("tabindex");
        matchedPairs++; if(matchedPairs===12) endGame(); else resetBoard();
    }

    function unflipCards(){
        lockBoard=true; setTimeout(()=>{firstCard?.classList.remove("flipped"); secondCard?.classList.remove("flipped"); resetBoard();},1000);
    }

    function resetBoard(){firstCard=null; secondCard=null; lockBoard=false;}

    function startTimer(){timerInterval=setInterval(()=>{timer++; timeElement.textContent=timer;},1000);}

    function endGame(){
        clearInterval(timerInterval);
        finalMoves.textContent=moves; finalTime.textContent=timer; winMessage.style.display="flex"; playAgainButton.focus();
    }

    restartButton.addEventListener("click",initGame);
    playAgainButton.addEventListener("click",()=>{winMessage.style.display="none"; initGame();});
    initGame();
});
