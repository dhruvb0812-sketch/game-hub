// Tic Tac Toe Module
let tttBoard = ['', '', '', '', '', '', '', '', ''];
let tttCurrentPlayer = 'X';
let tttMode = 'human'; // 'human' or 'ai'
let tttGameActive = true;

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

function initTicTacToe() {
    createTTTBoard();
    setupTTTControls();
}

function createTTTBoard() {
    const board = document.getElementById('ttt-board');
    board.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'ttt-cell';
        cell.textContent = tttBoard[i];
        cell.addEventListener('click', () => makeTTTMove(i));
        board.appendChild(cell);
    }
    
    updateTTTStatus();
}

function makeTTTMove(index) {
    if (!tttGameActive) return;
    if (tttBoard[index] !== '') return;
    if (tttMode === 'ai' && tttCurrentPlayer === 'O') return;
    
    tttBoard[index] = tttCurrentPlayer;
    createTTTBoard();
    
    if (checkTTTWin()) {
        updateTTTStatus(`${tttCurrentPlayer} wins! 🎉`);
        tttGameActive = false;
        updateGameStats('tictactoe', true);
        return;
    }
    
    if (checkTTTTie()) {
        updateTTTStatus("It's a tie! 🤝");
        tttGameActive = false;
        return;
    }
    
    tttCurrentPlayer = tttCurrentPlayer === 'X' ? 'O' : 'X';
    updateTTTStatus(`${tttCurrentPlayer}'s turn`);
    
    if (tttMode === 'ai' && tttCurrentPlayer === 'O' && tttGameActive) {
        setTimeout(() => makeAIMove(), 500);
    }
}

function makeAIMove() {
    if (!tttGameActive) return;
    
    // Simple AI: Try to win, block player, or random move
    let move = getBestMove();
    
    if (move !== -1) {
        tttBoard[move] = 'O';
        createTTTBoard();
        
        if (checkTTTWin()) {
            updateTTTStatus("AI wins! 🤖");
            tttGameActive = false;
            updateGameStats('tictactoe', false);
            return;
        }
        
        if (checkTTTTie()) {
            updateTTTStatus("It's a tie! 🤝");
            tttGameActive = false;
            return;
        }
        
        tttCurrentPlayer = 'X';
        updateTTTStatus("X's turn");
    }
}

function getBestMove() {
    // Check winning move
    for (let i = 0; i < 9; i++) {
        if (tttBoard[i] === '') {
            tttBoard[i] = 'O';
            if (checkTTTWin()) {
                tttBoard[i] = '';
                return i;
            }
            tttBoard[i] = '';
        }
    }
    
    // Check blocking move
    for (let i = 0; i < 9; i++) {
        if (tttBoard[i] === '') {
            tttBoard[i] = 'X';
            if (checkTTTWin()) {
                tttBoard[i] = '';
                return i;
            }
            tttBoard[i] = '';
        }
    }
    
    // Take center
    if (tttBoard[4] === '') return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8];
    for (let corner of corners) {
        if (tttBoard[corner] === '') return corner;
    }
    
    // Random move
    const emptySpots = tttBoard.reduce((arr, cell, idx) => {
        if (cell === '') arr.push(idx);
        return arr;
    }, []);
    
    if (emptySpots.length > 0) {
        return emptySpots[Math.floor(Math.random() * emptySpots.length)];
    }
    
    return -1;
}

function checkTTTWin() {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) {
            return true;
        }
    }
    return false;
}

function checkTTTTie() {
    return tttBoard.every(cell => cell !== '');
}

function resetTTT() {
    tttBoard = ['', '', '', '', '', '', '', '', ''];
    tttCurrentPlayer = 'X';
    tttGameActive = true;
    createTTTBoard();
}

function updateTTTStatus(message) {
    const statusDiv = document.getElementById('tttStatus');
    if (statusDiv) {
        statusDiv.innerHTML = `<i class="fas fa-circle-info"></i> ${message}`;
    }
}

function setupTTTControls() {
    document.getElementById('tttVsHuman')?.addEventListener('click', () => {
        tttMode = 'human';
        resetTTT();
        document.getElementById('tttVsHuman').classList.add('active');
        document.getElementById('tttVsAI').classList.remove('active');
    });
    
    document.getElementById('tttVsAI')?.addEventListener('click', () => {
        tttMode = 'ai';
        resetTTT();
        document.getElementById('tttVsAI').classList.add('active');
        document.getElementById('tttVsHuman').classList.remove('active');
    });
    
    document.getElementById('resetTTT')?.addEventListener('click', resetTTT);
}

document.addEventListener('DOMContentLoaded', initTicTacToe);
