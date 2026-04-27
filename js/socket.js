// Socket.io for multiplayer
let socket = null;

function initSocket() {
    // Connect to same origin for multiplayer
    socket = io(window.location.origin, {
        transports: ['websocket'],
        autoConnect: true
    });
    
    socket.on('connect', () => {
        console.log('Connected to game server');
    });
    
    socket.on('room-created', (data) => {
        showToast(`Room created! ID: ${data.roomId}`, 'success');
    });
    
    socket.on('game-start', (data) => {
        showToast('Game started! You are playing as Black', 'info');
        // Update chess board with FEN
        if (window.chessGame) {
            window.chessGame.load(data.fen);
            window.createChessBoard();
        }
    });
    
    socket.on('move-made', (data) => {
        if (window.chessGame && window.currentTurn !== (data.move.color === 'w' ? 'w' : 'b')) {
            window.chessGame.load(data.fen);
            window.createChessBoard();
            window.currentTurn = window.chessGame.turn();
            window.updateChessStatus();
            
            if (data.gameOver) {
                showToast(`Game Over! ${data.winner} wins!`, 'success');
            }
        }
    });
    
    socket.on('join-error', (message) => {
        showToast(message, 'error');
    });
    
    socket.on('invalid-move', () => {
        showToast('Invalid move!', 'error');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

// Make socket available globally
window.socket = socket;

// Initialize socket when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSocket, 1000);
});
