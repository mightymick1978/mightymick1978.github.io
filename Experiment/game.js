import * as UI from './ui.js'; // Assuming UI module handles direct DOM updates
import * as Audio from './audio.js'; // Assuming Audio module handles sounds

let playerCards = [];
let cpuCards = [];
let isPlayerTurnToChoose = true; // Player starts by choosing
let currentChosenStatKey = null;
let gameOver = false;
let allCardsData = [];

const STAT_KEYS = {
    SPEED: 'speed',
    POWER: 'power',
    CYLINDERS: 'cylinders',
    PRICE: 'price'
};

// Higher value is better for all stats in this game
function compareStats(playerValue, cpuValue) {
    if (playerValue > cpuValue) return 'player';
    if (cpuValue > playerValue) return 'cpu';
    return 'draw';
}

export function initGame(cardsData) {
    allCardsData = cardsData;
    gameOver = false;
    const shuffledCards = [...allCardsData].sort(() => Math.random() - 0.5);
    
    playerCards = [];
    cpuCards = [];
    shuffledCards.forEach((card, index) => {
        if (index % 2 === 0) {
            playerCards.push(card);
        } else {
            cpuCards.push(card);
        }
    });

    isPlayerTurnToChoose = true; // Player starts
    UI.updateCardCounts(playerCards.length, cpuCards.length);
    startRound();
}

function startRound() {
    if (gameOver) return;

    if (playerCards.length === 0) {
        endGame(false); // Player loses
        return;
    }
    if (cpuCards.length === 0) {
        endGame(true); // Player wins
        return;
    }

    UI.clearHighlights();
    currentChosenStatKey = null;

    const playerTopCard = playerCards[0];
    const cpuTopCard = cpuCards[0];

    UI.renderPlayerCard(playerTopCard, handleStatClick);
    UI.renderCpuCard(cpuTopCard, !isPlayerTurnToChoose); // Show CPU card face up if it's CPU's turn to choose, else face down

    if (isPlayerTurnToChoose) {
        UI.displayMessage("Your turn: Select a category from your card.");
    } else {
        UI.displayMessage("CPU is choosing a category...");
        // Disable player card interactions while CPU chooses
        UI.renderPlayerCard(playerTopCard, null); // No click handler
        setTimeout(cpuChooseStat, 1500); // Simulate CPU thinking
    }
}

function handleStatClick(statKey) {
    if (!isPlayerTurnToChoose || gameOver || currentChosenStatKey) return; // Prevent multiple clicks or clicks when not player's turn
    
    currentChosenStatKey = statKey;
    Audio.playSound('flip');
    UI.flipCpuCard(cpuCards[0]); // Reveal CPU card and then show its full stats
    
    // Highlight player's choice immediately
    UI.highlightStat(statKey, 'player', playerCards[0].stats[statKey].value, cpuCards[0].stats[statKey].value);

    setTimeout(() => resolveRound(statKey), 1000); // Delay for card flip animation
}

function cpuChooseStat() {
    if (gameOver || isPlayerTurnToChoose) return;

    const cpuTopCard = cpuCards[0];
    let bestStatKey = STAT_KEYS.SPEED; // Default
    let maxStatValue = -Infinity;

    // Simple AI: CPU chooses its best stat
    for (const key in cpuTopCard.stats) {
        if (cpuTopCard.stats[key].value > maxStatValue) {
            maxStatValue = cpuTopCard.stats[key].value;
            bestStatKey = key;
        }
    }
    currentChosenStatKey = bestStatKey;

    UI.displayMessage(`CPU chose: ${cpuTopCard.stats[bestStatKey].label}`);
    // CPU card is already face up if it's its turn to choose. Now highlight its choice.
    UI.highlightStat(bestStatKey, 'cpu', playerCards[0].stats[bestStatKey].value, cpuTopCard.stats[bestStatKey].value);

    setTimeout(() => resolveRound(bestStatKey), 1000);
}

function resolveRound(statKey) {
    if (gameOver) return;

    const playerCard = playerCards[0];
    const cpuCard = cpuCards[0];
    const playerValue = playerCard.stats[statKey].value;
    const cpuValue = cpuCard.stats[statKey].value;

    const roundWinner = compareStats(playerValue, cpuValue);

    UI.highlightWinningLosingStats(statKey, playerValue, cpuValue, roundWinner);

    let message = '';
    if (roundWinner === 'player') {
        message = `You win this round! ${playerCard.stats[statKey].label}: ${playerValue} vs ${cpuValue}.`;
        isPlayerTurnToChoose = true;
    } else if (roundWinner === 'cpu') {
        message = `CPU wins this round! ${cpuCard.stats[statKey].label}: ${cpuValue} vs ${playerValue}.`;
        isPlayerTurnToChoose = false;
    } else {
        message = `It's a draw! ${playerCard.stats[statKey].label}: ${playerValue} vs ${cpuValue}.`;
        // Chooser remains the same on draw
    }
    UI.displayMessage(message);

    setTimeout(() => processRoundEnd(roundWinner), 2500); // Delay to show results
}

function processRoundEnd(winner) {
    if (gameOver) return;

    const playerTopCard = playerCards.shift();
    const cpuTopCard = cpuCards.shift();

    if (winner === 'player') {
        playerCards.push(playerTopCard, cpuTopCard);
    } else if (winner === 'cpu') {
        cpuCards.push(cpuTopCard, playerTopCard);
    } else { // Draw
        playerCards.push(playerTopCard);
        cpuCards.push(cpuTopCard);
    }
    
    // Sort cards in hand by name for consistency (optional)
    // playerCards.sort((a,b) => a.name.localeCompare(b.name));
    // cpuCards.sort((a,b) => a.name.localeCompare(b.name));


    UI.updateCardCounts(playerCards.length, cpuCards.length);

    if (playerCards.length === 0 || cpuCards.length === 0) {
        endGame(playerCards.length > 0);
    } else {
        startRound();
    }
}

function endGame(playerWon) {
    gameOver = true;
    if (playerWon) {
        UI.displayMessage("Congratulations! You've won all the cards!");
        UI.showFireworks();
        Audio.playSound('win_sound');
    } else {
        UI.displayMessage("CPU has won all the cards. Better luck next time!");
    }
    // Optionally add a "Play Again" button
    UI.showPlayAgainButton(initGame, allCardsData);
}

