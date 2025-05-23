import confetti from 'canvas-confetti';

const playerCardSlot = document.getElementById('player-card-slot');
const cpuCardSlot = document.getElementById('cpu-card-slot');
const playerCardCountEl = document.getElementById('player-card-count');
const cpuCardCountEl = document.getElementById('cpu-card-count');
const gameMessageEl = document.getElementById('game-message');
const volumeIconEl = document.getElementById('volume-icon');

let currentStatClickHandler = null;

export function renderPlayerCard(cardData, statClickHandler) {
    currentStatClickHandler = statClickHandler;
    playerCardSlot.innerHTML = createCardHTML(cardData, 'player', false, statClickHandler);
    if (statClickHandler) { // only add listeners if a handler is provided
        playerCardSlot.querySelectorAll('.card ul li').forEach(li => {
            li.addEventListener('click', () => {
                if (currentStatClickHandler) { // Check if a handler is still active
                     currentStatClickHandler(li.dataset.statKey);
                }
            });
        });
    }
}

export function renderCpuCard(cardData, isFaceUp) {
    cpuCardSlot.innerHTML = createCardHTML(cardData, 'cpu', !isFaceUp, null); // CPU card stats are not clickable by player
}

export function flipCpuCard(cardData) {
    // Re-render CPU card but ensure it's face up by removing 'flipped' class or by specific logic
    // For simplicity, we just re-render it ensuring it's face up
    // The CSS transition handles the visual flip if the 'flipped' class is toggled.
    // However, the current createCardHTML decides initial flip state.
    // A more robust flip might involve directly manipulating the .flipped class on an existing element.
    
    // Simple approach: re-render as face-up
    cpuCardSlot.innerHTML = createCardHTML(cardData, 'cpu', false, null);
    // If using CSS class for flipping, ensure it's correct:
    const cpuCardElement = cpuCardSlot.querySelector('.card');
    if (cpuCardElement) {
        // This assumes the card was rendered with .card-back visible and now needs .card-front
        // This part needs to be coordinated with how createCardHTML sets up the card initially.
        // Let's assume createCardHTML(..., ..., isFlipped=true) renders a card initially showing its back.
        // To flip it to front, we re-render with isFlipped=false.
        // For a smoother CSS animation, one would normally toggle a class on an existing DOM element.
        // Let's refine createCardHTML to support this better.
        // For now, the re-render will "snap" it to face up.
        // To enable CSS flip, we need to ensure the card structure (front/back faces) is always there.

        // Let's try a class toggle approach if the card structure is complete
        const cardToFlip = cpuCardSlot.querySelector('.card');
        if (cardToFlip && cardToFlip.classList.contains('flipped')) {
             // If it was 'flipped' (showing back), remove 'flipped' to show front
             // This requires createCardHTML to render both faces.
             setTimeout(() => cardToFlip.classList.remove('flipped'), 50); // Small delay for render
        } else if (cardToFlip) {
            // If it was already face-up (e.g. CPU's turn to choose), this function might be called to highlight.
            // No actual flip needed in that case.
        }
    }
}


function createCardHTML(cardData, playerType, isFlipped, statClickHandler) {
    if (!cardData) {
        return `<div class="card-placeholder">No card</div>`;
    }

    const statsHTML = Object.entries(cardData.stats).map(([key, stat]) => `
        <li data-stat-key="${key}" class="${playerType}-stat-${key} ${statClickHandler ? 'clickable' : ''}">
            <span class="stat-label">${stat.label}:</span>
            <span class="stat-value">${stat.value} ${stat.unit || ''}</span>
        </li>
    `).join('');

    // Ensure card structure for flipping
    return `
        <div class="card ${isFlipped ? 'flipped' : ''}" id="${playerType}-card">
            <div class="card-face card-front">
                <h3>${cardData.name}</h3>
                <div class="card-image-container">
                    <img src="${cardData.image}" alt="${cardData.name}">
                </div>
                <ul>${statsHTML}</ul>
            </div>
            <div class="card-face card-back">
                <img src="card_back.png" alt="Card Back">
            </div>
        </div>
    `;
}


export function updateCardCounts(playerCount, cpuCount) {
    playerCardCountEl.textContent = playerCount;
    cpuCardCountEl.textContent = cpuCount;
}

export function displayMessage(message) {
    gameMessageEl.textContent = message;
}

export function highlightStat(statKey, cardOwner, playerValue, cpuValue) {
    // This function is intended to highlight the chosen stat before comparison result
    // For example, player clicks "Speed", so "Speed" on player card gets a neutral highlight
    // And after CPU card flips, "Speed" on CPU card gets a neutral highlight
    // Then highlightWinningLosingStats applies green/red
    
    clearHighlights(); // Clear previous highlights

    const playerStatEl = document.querySelector(`#player-card .player-stat-${statKey}`);
    const cpuStatEl = document.querySelector(`#cpu-card .cpu-stat-${statKey}`);

    if (cardOwner === 'player' && playerStatEl) {
        playerStatEl.style.backgroundColor = '#e0e0e0'; // A neutral highlight
    } else if (cardOwner === 'cpu' && cpuStatEl) {
        cpuStatEl.style.backgroundColor = '#e0e0e0'; // A neutral highlight for CPU's choice display
    }
}

export function highlightWinningLosingStats(statKey, playerValue, cpuValue, winner) {
    clearHighlights(); // Clear any neutral highlights first

    const playerStatEl = document.querySelector(`#player-card .player-stat-${statKey}`);
    const cpuStatEl = document.querySelector(`#cpu-card .cpu-stat-${statKey}`);

    if (!playerStatEl || !cpuStatEl) return;

    if (winner === 'player') {
        playerStatEl.classList.add('highlight-win');
        cpuStatEl.classList.add('highlight-lose');
    } else if (winner === 'cpu') {
        playerStatEl.classList.add('highlight-lose');
        cpuStatEl.classList.add('highlight-win');
    } else { // Draw
        playerStatEl.style.backgroundColor = '#ffc107'; // Yellow for draw
        playerStatEl.style.color = '#333';
        cpuStatEl.style.backgroundColor = '#ffc107';
        cpuStatEl.style.color = '#333';
    }
}


export function clearHighlights() {
    document.querySelectorAll('.card ul li').forEach(li => {
        li.classList.remove('highlight-win', 'highlight-lose');
        li.style.backgroundColor = ''; // Reset any inline style like neutral or draw highlight
        li.style.color = '';
    });
}

export function updateVolumeIcon(isMuted) {
    volumeIconEl.src = isMuted ? 'volume_off.png' : 'volume_on.png';
    volumeIconEl.alt = isMuted ? 'Unmute' : 'Mute';
}

export function showFireworks() {
    const duration = 5 * 1000; // 5 seconds
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

export function showPlayAgainButton(startGameFunction, cardsData) {
    let playAgainButton = document.getElementById('play-again-button');
    if (!playAgainButton) {
        playAgainButton = document.createElement('button');
        playAgainButton.id = 'play-again-button';
        playAgainButton.textContent = 'Play Again?';
        playAgainButton.style.marginTop = '20px';
        playAgainButton.style.padding = '10px 20px';
        playAgainButton.style.fontSize = '1em';
        playAgainButton.style.cursor = 'pointer';
        playAgainButton.style.backgroundColor = '#ffc107';
        playAgainButton.style.color = '#1e1e1e';
        playAgainButton.style.border = 'none';
        playAgainButton.style.borderRadius = '5px';
        
        const messageArea = document.getElementById('message-area');
        messageArea.appendChild(playAgainButton);

        playAgainButton.addEventListener('click', () => {
            // Remove button before restarting
            playAgainButton.remove();
            // Call the passed startGameFunction (which is Game.initGame)
            startGameFunction(cardsData); 
        });
    }
}

