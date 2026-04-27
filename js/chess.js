// Chess Module with AI
let chessGame = null;
let selectedSquare = null;
let gameMode = 'ai'; // 'ai' or 'multiplayer'
let currentTurn = 'w';
let moveHistory = [];

// Initialize chess board
function initChess() {
    chessGame = new Chess();
    createChessBoard();
    setupChessControls();
    updateChessStatus();
}

// Create visual board
function createChessBoard() {
    const board = document.getElementById('chessboard');
    board.innerHTML = '';
    
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            const squareName = files[col] + (8 - row);
            const piece = chessGame.get(squareName);
            const isLight = (row + col) % 2 === 0;
            
            square.className = `chess-square ${isLight ? 'light' : 'dark'}`;
            square.dataset.square = squareName;
            
            if (piece) {
                square.innerHTML = getPieceSymbol(piece);
            }
            
            square.addEventListener('click', () => onSquareClick(squareName));
            board.appendChild(square);
        }
    }
}

// Get chess piece symbol
function getPieceSymbol(piece) {
    const symbols = {
        'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙',
        'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟'
    };
    return symbols[piece.type + (piece.color === 'w' ? '' : '')] || '';
}

// Handle square click
function onSquareClick(square) {
    if (gameMode === 'ai' && currentTurn !== 'w') return;
    
    if (selectedSquare) {
        // Try to move
        const move = {
            from: selectedSquare,
            to: square,
            promotion: 'q'
        };
        
        try {
            const result = chessGame.move(move);
            if (result) {
                updateMoveHistory(result);
                createChessBoard();
                currentTurn = chessGame.turn();
                updateChessStatus();
                selectedSquare = null;
                
                // Check game over
                if (chessGame.game_over()) {
                    handleGameOver();
                } else if (gameMode === 'ai' && currentTurn === 'b') {
                    setTimeout(() => makeAIMove(), 500);
                }
            } else {
                selectedSquare = null;
                clearHighlights();
                onSquareClick(square);
            }
        } catch (e) {
            selectedSquare = null;
            clearHighlights();
        }
    } else {
        // Select square
        const piece = chessGame.get(square);
        if (piece && piece.color === currentTurn) {
            selectedSquare = square;
            highlightSquare(square);
            highlightValidMoves(square);
        }
    }
}

// Make AI move
function makeAIMove() {
    if (gameMode !== 'ai' || currentTurn !== 'b' || chessGame.game_over()) return;
    
    const moves = chessGame.moves();
    if (moves.length > 0) {
        // Simple AI: random move (can be improved)
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        const move = chessGame.move(randomMove);
        if (move) {
            updateMoveHistory(move);
            createChessBoard();
            currentTurn = chessGame.turn();
            updateChessStatus();
            
            if (chessGame.game_over()) {
                handleGameOver();
            }
        }
    }
}

// Highlight valid moves
function highlightValidMoves(square) {
    const moves = chessGame.moves({ verbose: true });
    const validMoves = moves.filter(m => m.from === square);
    
    validMoves.forEach(move => {
        const targetSquare = document.querySelector(`[data-square="${move.to}"]`);
        if (targetSquare) {
            targetSquare.classList.add('valid-move');
        }
    });
}

function highlightSquare(square) {
    clearHighlights();
    const squareElement = document.querySelector(`[data-square="${square}"]`);
    if (squareElement) {
        squareElement.classList.add('selected');
    }
}

function clearHighlights() {
    document.querySelectorAll('.chess-square').forEach(sq => {
        sq.classList.remove('selected', 'valid-move');
    });
}

// Update move history
function updateMoveHistory(move) {
    moveHistory.push(move);
    const historyList = document.getElementById('moveHistoryList');
    historyList.innerHTML = moveHistory.map((m, i) => {
        const moveNumber = Math.floor(i / 2) + 1;
        if (i % 2 === 0) {
            return `<div>${moveNumber}. ${m.san}</div>`;
        } else {
            return `<div style="padding-left: 40px">${m.san}</div>`;
        }
    }).join('');
}

// Update game status
function updateChessStatus() {
    const statusDiv = document.getElementById('chessStatus');
    if (chessGame.in_checkmate()) {
        const loser = chessGame.turn() === 'w' ? 'White' : 'Black';
        statusDiv.innerHTML = `<i class="fas fa-crown"></i> Checkmate! ${loser === 'White' ? 'Black' : 'White'} wins!`;
        if (gameMode === 'ai') {
            const won = chessGame.turn() === 'b';
            updateGameStats('chess', won);
        }
    } else if (chessGame.in_check()) {
        statusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${chessGame.turn() === 'w' ? 'White' : 'Black'} is in check!`;
    } else if (chessGame.in_stalemate()) {
        statusDiv.innerHTML = `<i class="fas fa-handshake"></i> Stalemate! Game drawn.`;
    } else {
        statusDiv.innerHTML = `<i class="fas fa-circle-info"></i> ${chessGame.turn() === 'w' ? 'White' : 'Black'}'s turn`;
    }
}

function handleGameOver() {
    updateChessStatus();
    if (gameMode === 'ai') {
        const won = chessGame.in_checkmate() && chessGame.turn() === 'b';
        updateGameStats('chess', won);
        if (won) showToast('Congratulations! You won!', 'success');
        else if (chessGame.in_checkmate()) showToast('AI wins! Better luck next time!', 'error');
    }
}

// Reset chess game
function resetChess() {
    chessGame = new Chess();
    selectedSquare = null;
    moveHistory = [];
    currentTurn = 'w';
    createChessBoard();
    updateChessStatus();
    document.getElementById('moveHistoryList').innerHTML = '';
}

// Setup chess controls
function setupChessControls() {
    document.getElementById('vsAIBtn')?.addEventListener('click', () => {
        gameMode = 'ai';
        resetChess();
        document.getElementById('vsAIBtn').classList.add('active');
        document.getElementById('createRoomBtn').classList.remove('active');
        document.querySelector('.room-controls').style.display = 'none';
    });
    
    document.getElementById('createRoomBtn')?.addEventListener('click', () => {
        gameMode = 'multiplayer';
        resetChess();
        document.getElementById('createRoomBtn').classList.add('active');
        document.getElementById('vsAIBtn').classList.remove('active');
        document.querySelector('.room-controls').style.display = 'flex';
        
        if (window.socket) {
            window.socket.emit('create-room', {});
            window.socket.once('room-created', (data) => {
                showToast(`Room created: ${data.roomId}`, 'success');
                document.getElementById('roomIdInput').value = data.roomId;
            });
        }
    });
    
    document.getElementById('joinRoomBtn')?.addEventListener('click', () => {
        const roomId = document.getElementById('roomIdInput').value;
        if (roomId && window.socket) {
            window.socket.emit('join-room', { roomId });
        }
    });
    
    document.getElementById('resetChess')?.addEventListener('click', () => resetChess());
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initChess();
});
