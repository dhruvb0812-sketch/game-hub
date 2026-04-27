// Sudoku Module
let sudokuBoard = [];
let sudokuSolution = [];
let currentDifficulty = 'medium';

// Generate Sudoku puzzle
function generateSudoku(difficulty) {
    // Empty grid
    const emptyGrid = Array(9).fill().map(() => Array(9).fill(0));
    
    // Fill diagonal 3x3 boxes
    fillDiagonal(emptyGrid);
    
    // Fill remaining cells
    solveSudoku(emptyGrid);
    
    // Copy solution
    sudokuSolution = emptyGrid.map(row => [...row]);
    
    // Remove cells based on difficulty
    const cellsToRemove = {
        easy: 40,
        medium: 50,
        hard: 60,
        expert: 70
    };
    
    sudokuBoard = emptyGrid.map(row => [...row]);
    const removeCount = cellsToRemove[difficulty];
    let removed = 0;
    
    while (removed < removeCount) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (sudokuBoard[row][col] !== 0) {
            sudokuBoard[row][col] = 0;
            removed++;
        }
    }
    
    renderSudokuBoard();
}

// Fill diagonal 3x3 boxes
function fillDiagonal(grid) {
    for (let i = 0; i < 9; i += 3) {
        fillBox(grid, i, i);
    }
}

function fillBox(grid, row, col) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffleArray(numbers);
    
    let index = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            grid[row + i][col + j] = numbers[index++];
        }
    }
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// Solve Sudoku using backtracking
function solveSudoku(grid) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValidMove(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (solveSudoku(grid)) {
                            return true;
                        }
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValidMove(grid, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[boxRow + i][boxCol + j] === num) return false;
        }
    }
    
    return true;
}

// Render Sudoku board
function renderSudokuBoard() {
    const boardDiv = document.getElementById('sudoku-board');
    boardDiv.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            
            const value = sudokuBoard[i][j];
            if (value !== 0) {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                input.readOnly = sudokuSolution[i][j] === value;
                input.maxLength = 1;
                input.addEventListener('input', (e) => {
                    const newValue = e.target.value;
                    if (newValue >= '1' && newValue <= '9') {
                        sudokuBoard[i][j] = parseInt(newValue);
                    } else {
                        sudokuBoard[i][j] = 0;
                        e.target.value = '';
                    }
                });
                cell.appendChild(input);
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.addEventListener('input', (e) => {
                    const newValue = e.target.value;
                    if (newValue >= '1' && newValue <= '9') {
                        sudokuBoard[i][j] = parseInt(newValue);
                    } else {
                        sudokuBoard[i][j] = 0;
                        e.target.value = '';
                    }
                });
                cell.appendChild(input);
            }
            
            // Add thicker borders for 3x3 boxes
            if ((i + 1) % 3 === 0 && i !== 8) {
                cell.style.borderBottom = '2px solid white';
            }
            if ((j + 1) % 3 === 0 && j !== 8) {
                cell.style.borderRight = '2px solid white';
            }
            
            boardDiv.appendChild(cell);
        }
    }
}

// Check sudoku solution
function checkSudoku() {
    let isComplete = true;
    let isCorrect = true;
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (sudokuBoard[i][j] === 0) {
                isComplete = false;
            }
            if (sudokuBoard[i][j] !== sudokuSolution[i][j]) {
                isCorrect = false;
            }
        }
    }
    
    if (isComplete && isCorrect) {
        showToast('Perfect! You solved the Sudoku! 🎉', 'success');
        updateGameStats('sudoku', true);
        generateSudoku(currentDifficulty);
    } else if (isComplete) {
        showToast('Board is full but has errors. Keep trying!', 'error');
    } else {
        showToast('Keep going! You can do it!', 'info');
    }
}

// Get hint
function getHint() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (sudokuBoard[i][j] === 0) {
                sudokuBoard[i][j] = sudokuSolution[i][j];
                renderSudokuBoard();
                showToast(`Hint: Row ${i+1}, Column ${j+1} is ${sudokuSolution[i][j]}`, 'info');
                return;
            }
        }
    }
}

// Reset current puzzle
function resetSudoku() {
    const originalPuzzle = sudokuSolution.map((row, i) => 
        row.map((cell, j) => sudokuSolution[i][j] === sudokuBoard[i][j] ? cell : 0)
    );
    // Not perfect, but regenerates
    generateSudoku(currentDifficulty);
}

// New game
function newSudoku() {
    generateSudoku(currentDifficulty);
}

// Setup sudoku controls
function setupSudoku() {
    generateSudoku('medium');
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.diff;
            generateSudoku(currentDifficulty);
        });
    });
    
    document.getElementById('checkSudoku')?.addEventListener('click', checkSudoku);
    document.getElementById('hintSudoku')?.addEventListener('click', getHint);
    document.getElementById('resetSudoku')?.addEventListener('click', resetSudoku);
    document.getElementById('newSudoku')?.addEventListener('click', newSudoku);
}

document.addEventListener('DOMContentLoaded', setupSudoku);
