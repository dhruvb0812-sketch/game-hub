// Memory Match Game
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let canFlip = true;
let memoryTimer = null;
let memorySeconds = 0;

const cardIcons = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'
];

function initMemory() {
    createMemoryBoard();
    startMemoryTimer();
}

function createMemoryBoard() {
    // Select 8 pairs (16 cards)
    const selectedIcons = [...cardIcons.slice(0, 8), ...cardIcons.slice(0, 8)];
    shuffleArray(selectedIcons);
    
    memoryCards = selectedIcons.map((icon, index) => ({
        id: index,
        icon: icon,
        flipped: false,
        matched: false
    }));
    
    matchedPairs = 0;
    moves = 0;
    flippedCards = [];
    canFlip = true;
    
    updateMemoryStats();
    renderMemoryBoard();
}

function renderMemoryBoard() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    
    memoryCards.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'memory-card';
        if (card.flipped || card.matched) {
            cardDiv.classList.add('flipped');
            cardDiv.textContent = card.icon;
        } else {
            cardDiv.textContent = '?';
        }
        if (card.matched) {
            cardDiv.classList.add('matched');
        }
        
        cardDiv.addEventListener('click', () => flipCard(index));
        grid.appendChild(cardDiv);
    });
}

function flipCard(index) {
    if (!canFlip) return;
    if (memoryCards[index].flipped) return;
    if (memoryCards[index].matched) return;
    if (flippedCards.length >= 2) return;
    
    memoryCards[index].flipped = true;
    renderMemoryBoard();
    
    flippedCards.push(index);
    
    if (flippedCards.length === 2) {
        moves++;
        updateMemoryStats();
        checkMatch();
    }
}

function checkMatch() {
    const card1 = memoryCards[flippedCards[0]];
    const card2 = memoryCards[flippedCards[1]];
    
    if (card1.icon === card2.icon) {
        // Match found
        card1.matched = true;
        card2.matched = true;
        matchedPairs++;
        
        flippedCards = [];
        renderMemoryBoard();
        
        if (matchedPairs === 8) {
            // Game complete
            clearInterval(memoryTimer);
            showToast(`Congratulations! You completed in ${moves} moves and ${formatTime(memorySeconds)}!`, 'success');
            updateGameStats('memory', true);
        }
    } else {
        // No match
        canFlip = false;
        setTimeout(() => {
            card1.flipped = false;
            card2.flipped = false;
            flippedCards = [];
            canFlip = true;
            renderMemoryBoard();
        }, 1000);
    }
}

function resetMemory() {
    clearInterval(memoryTimer);
    memorySeconds = 0;
    updateMemoryTimerDisplay();
    createMemoryBoard();
    startMemoryTimer();
}

function startMemoryTimer() {
    memoryTimer = setInterval(() => {
        memorySeconds++;
        updateMemoryTimerDisplay();
    }, 1000);
}

function updateMemoryTimerDisplay() {
    const timeDisplay = document.getElementById('memoryTime');
    if (timeDisplay) {
        timeDisplay.textContent = formatTime(memorySeconds);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateMemoryStats() {
    document.getElementById('moves').textContent = moves;
    document.getElementById('matches').textContent = matchedPairs;
}

function setupMemory() {
    initMemory();
    document.getElementById('resetMemory')?.addEventListener('click', resetMemory);
}

document.addEventListener('DOMContentLoaded', setupMemory);
