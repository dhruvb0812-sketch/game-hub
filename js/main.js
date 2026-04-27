// Main Application Controller
let currentGame = 'dashboard';

// Particles animation
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }
    
    function init() {
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }
        animate();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        init();
    });
    
    init();
}

// Switch between games
function switchGame(gameId) {
    // Hide all game containers
    document.querySelectorAll('.game-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Show selected game
    const selectedContainer = document.getElementById(gameId);
    if (selectedContainer) {
        selectedContainer.classList.add('active');
    }
    
    // Update nav active state
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.game === gameId) {
            link.classList.add('active');
        }
    });
    
    currentGame = gameId;
    
    // Close mobile menu if open
    document.getElementById('mobileMenu')?.classList.remove('open');
    
    // Refresh game if needed
    if (gameId === 'memory') {
        if (typeof resetMemory === 'function') resetMemory();
    } else if (gameId === 'sudoku') {
        if (typeof newSudoku === 'function') newSudoku();
    } else if (gameId === 'chess') {
        if (typeof resetChess === 'function') resetChess();
    } else if (gameId === 'tictactoe') {
        if (typeof resetTTT === 'function') resetTTT();
    }
}

// Mobile menu toggle
function setupMobileMenu() {
    const menuIcon = document.getElementById('menuIcon');
    const mobileMenu = document.getElementById('mobileMenu');
    
    menuIcon?.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
    });
}

// Setup game selection
function setupGameSelection() {
    // Nav links
    document.querySelectorAll('.nav-links a, .mobile-menu a, .game-card, .logo').forEach(element => {
        element.addEventListener('click', (e) => {
            const game = element.dataset.game;
            if (game) {
                e.preventDefault();
                switchGame(game);
            }
        });
    });
}

// Update dashboard stats periodically
function updateDashboardStats() {
    if (currentGame === 'dashboard' && typeof loadUserStats === 'function') {
        loadUserStats();
    }
    setTimeout(updateDashboardStats, 5000);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    setupMobileMenu();
    setupGameSelection();
    checkAuth();
    updateDashboardStats();
    
    // Set default active nav
    const savedGame = localStorage.getItem('lastGame') || 'dashboard';
    switchGame(savedGame);
    
    // Save last game
    document.querySelectorAll('[data-game]').forEach(el => {
        el.addEventListener('click', () => {
            if (el.dataset.game) {
                localStorage.setItem('lastGame', el.dataset.game);
            }
        });
    });
});

// Export for debugging
window.switchGame = switchGame;
