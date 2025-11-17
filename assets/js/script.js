/* TEMPORARY DEBUG STYLES - REMOVE AFTER FIX */
.debug-border {
    border: 3px solid red !important;
}

.debug-game-board::before {
    content: "GAME BOARD AREA - CARDS SHOULD APPEAR HERE";
    display: block;
    padding: 20px;
    background: rgba(255, 0, 0, 0.2);
    color: white;
    text-align: center;
    font-weight: bold;
    border: 2px dashed red;
    margin-bottom: 20px;
}