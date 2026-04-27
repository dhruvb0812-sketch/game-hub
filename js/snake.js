// Snake Game Module
let snakeCanvas = null;
let snakeCtx = null;
let snakeGame = null;
let snakeInterval = null;
let snakeScore = 0;
let snakeHighScore = 0;

class SnakeGame {
    constructor() {
        this.gridSize = 20;
        this.cellSize = 20;
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = 'RIGHT';
        this.nextDirection = 'RIGHT';
        this.food = this.generateFood();
        this.gameRunning = false;
        this.score = 0;
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }
    
    update() {
        if (!this.gameRunning) return;
        
        this.direction = this.nextDirection;
        
        // Move snake
        const head = {...this.snake[0]};
        switch(this.direction) {
            case 'UP': head.y--; break;
            case 'DOWN': head.y++; break;
            case 'LEFT': head.x--; break;
            case 'RIGHT': head.x++; break;
        }
        
        // Check collision with walls
        if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
            this.gameOver();
            return;
        }
        
        // Check collision with self
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            document.getElementById('snakeScore').textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }
    
    draw() {
        snakeCtx.fillStyle = '#1a1a2e';
        snakeCtx.fillRect(0, 0, 400, 400);
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            const gradient = snakeCtx.createLinearGradient(
                segment.x * this.cellSize, 
                segment.y * this.cellSize,
                (segment.x + 1) * this.cellSize,
                (segment.y + 1) * this.cellSize
            );
            gradient.addColorStop(0, '#4ade80');
            gradient.addColorStop(1, '#22c55e');
            snakeCtx.fillStyle = gradient;
            snakeCtx.fillRect(
                segment.x * this.cellSize,
                segment.y * this.cellSize,
                this.cellSize - 1,
                this.cellSize - 1
            );
        });
        
        // Draw food
        snakeCtx.fillStyle = '#f87171';
        snakeCtx.beginPath();
        snakeCtx.arc(
            this.food.x * this.cellSize + this.cellSize / 2,
            this.food.y * this.cellSize + this.cellSize / 2,
            this.cellSize / 2 - 2,
            0,
            Math.PI * 2
        );
        snakeCtx.fill();
        
        // Draw eyes on head
        if (this.snake.length > 0) {
            const head = this.snake[0];
            snakeCtx.fillStyle = 'white';
            snakeCtx.beginPath();
            snakeCtx.arc(head.x * this.cellSize + 5, head.y * this.cellSize + 5, 2, 0, Math.PI * 2);
            snakeCtx.arc(head.x * this.cellSize + 15, head.y * this.cellSize + 5, 2, 0, Math.PI * 2);
            snakeCtx.fill();
            snakeCtx.fillStyle = 'black';
            snakeCtx.beginPath();
            snakeCtx.arc(head.x * this.cellSize + 5, head.y * this.cellSize + 5, 1, 0, Math.PI * 2);
            snakeCtx.arc(head.x * this.cellSize + 15, head.y * this.cellSize + 5, 1, 0, Math.PI * 2);
            snakeCtx.fill();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(snakeInterval);
        snakeInterval = null;
        
        if (this.score > snakeHighScore) {
            snakeHighScore = this.score;
            localStorage.setItem('snakeHighScore', snakeHighScore);
            document.getElementById('snakeHighScore').textContent = snakeHighScore;
            showToast(`New High Score: ${snakeHighScore}!`, 'success');
        }
        
        updateGameStats('snake', false);
        showToast(`Game Over! Score: ${this.score}`, 'error');
    }
    
    start() {
        if (snakeInterval) clearInterval(snakeInterval);
        this.gameRunning = true;
        snakeInterval = setInterval(() => this.update(), 150);
    }
    
    pause() {
        if (snakeInterval) {
            clearInterval(snakeInterval);
            snakeInterval = null;
            this.gameRunning = false;
        }
    }
    
    reset() {
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = 'RIGHT';
        this.nextDirection = 'RIGHT';
        this.score = 0;
        document.getElementById('snakeScore').textContent = '0';
        this.food = this.generateFood();
        if (snakeInterval) clearInterval(snakeInterval);
        snakeInterval = null;
        this.draw();
    }
    
    setDirection(direction) {
        const opposite = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };
        if (opposite[direction] !== this.direction) {
            this.nextDirection = direction;
        }
    }
}

function initSnake() {
    snakeCanvas = document.getElementById('snakeCanvas');
    snakeCtx = snakeCanvas.getContext('2d');
    snakeGame = new SnakeGame();
    
    snakeHighScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
    document.getElementById('snakeHighScore').textContent = snakeHighScore;
    
    snakeGame.draw();
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!snakeGame) return;
        switch(e.key) {
            case 'ArrowUp': snakeGame.setDirection('UP'); break;
            case 'ArrowDown': snakeGame.setDirection('DOWN'); break;
            case 'ArrowLeft': snakeGame.setDirection('LEFT'); break;
            case 'ArrowRight': snakeGame.setDirection('RIGHT'); break;
            case ' ': 
                e.preventDefault();
                if (snakeGame.gameRunning) snakeGame.pause();
                else snakeGame.start();
                break;
        }
    });
    
    // Button controls
    document.getElementById('snakeStart')?.addEventListener('click', () => {
        if (!snakeGame.gameRunning) {
            if (snakeGame.score === 0) snakeGame.reset();
            snakeGame.start();
        }
    });
    
    document.getElementById('snakePause')?.addEventListener('click', () => {
        snakeGame.pause();
    });
    
    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = btn.dataset.dir;
            if (snakeGame) snakeGame.setDirection(dir);
            if (!snakeGame.gameRunning && snakeGame.score === 0) {
                snakeGame.start();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initSnake);
