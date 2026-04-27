// Authentication Module
const API_BASE = window.location.origin;

let currentUser = null;

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        showUserUI();
        return true;
    } else {
        showAuthUI();
        return false;
    }
}

// Show logged in UI
function showUserUI() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userSection').style.display = 'flex';
    document.getElementById('usernameDisplay').textContent = currentUser?.username || 'User';
    document.getElementById('welcomeName').textContent = currentUser?.username || 'Guest';
    
    // Load user stats
    loadUserStats();
}

// Show auth UI
function showAuthUI() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userSection').style.display = 'none';
    document.getElementById('welcomeName').textContent = 'Guest';
}

// Login
async function login(email, password) {
    try {
        showToast('Logging in...', 'info');
        
        // For demo, create dummy user since backend might not be deployed
        if (email === 'demo@example.com' && password === 'demo123') {
            const dummyUser = {
                id: '1',
                username: 'DemoPlayer',
                email: 'demo@example.com'
            };
            localStorage.setItem('token', 'dummy_token');
            localStorage.setItem('user', JSON.stringify(dummyUser));
            currentUser = dummyUser;
            showUserUI();
            showToast('Login successful!', 'success');
            closeModals();
            return true;
        }
        
        // Try real API if available
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            showUserUI();
            showToast('Login successful!', 'success');
            closeModals();
            return true;
        } else {
            const error = await response.json();
            showToast(error.error || 'Login failed', 'error');
            return false;
        }
    } catch (error) {
        // Offline mode - allow demo account
        if (email === 'demo@example.com' && password === 'demo123') {
            const dummyUser = {
                id: '1',
                username: 'DemoPlayer',
                email: 'demo@example.com'
            };
            localStorage.setItem('token', 'dummy_token');
            localStorage.setItem('user', JSON.stringify(dummyUser));
            currentUser = dummyUser;
            showUserUI();
            showToast('Login successful (Demo Mode)!', 'success');
            closeModals();
            return true;
        }
        showToast('Login failed. Try demo@example.com / demo123', 'error');
        return false;
    }
}

// Signup
async function signup(username, email, password) {
    try {
        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return false;
        }
        
        showToast('Creating account...', 'info');
        
        const response = await fetch(`${API_BASE}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            showUserUI();
            showToast('Account created successfully!', 'success');
            closeModals();
            return true;
        } else {
            const error = await response.json();
            showToast(error.error || 'Signup failed', 'error');
            return false;
        }
    } catch (error) {
        // Offline demo signup
        const dummyUser = {
            id: Date.now().toString(),
            username: username,
            email: email
        };
        localStorage.setItem('token', 'dummy_token_' + Date.now());
        localStorage.setItem('user', JSON.stringify(dummyUser));
        currentUser = dummyUser;
        showUserUI();
        showToast('Account created (Demo Mode)!', 'success');
        closeModals();
        return true;
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    showAuthUI();
    showToast('Logged out successfully', 'success');
    // Reset to dashboard
    switchGame('dashboard');
}

// Load user stats
async function loadUserStats() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Load stats from localStorage or API
        const stats = JSON.parse(localStorage.getItem('gameStats_' + currentUser?.id) || '{}');
        
        const totalGames = (stats.chess?.played || 0) + (stats.sudoku?.played || 0) + 
                          (stats.memory?.played || 0) + (stats.tictactoe?.played || 0);
        const totalWins = (stats.chess?.won || 0) + (stats.sudoku?.won || 0) + 
                         (stats.memory?.won || 0) + (stats.tictactoe?.won || 0);
        const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
        
        document.getElementById('totalGames').textContent = totalGames;
        document.getElementById('totalWins').textContent = totalWins;
        document.getElementById('winRate').textContent = winRate + '%';
        document.getElementById('streak').textContent = localStorage.getItem('streak_' + currentUser?.id) || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update game stats
function updateGameStats(game, won) {
    if (!currentUser) return;
    
    const stats = JSON.parse(localStorage.getItem('gameStats_' + currentUser.id) || '{}');
    if (!stats[game]) stats[game] = { played: 0, won: 0 };
    
    stats[game].played++;
    if (won) stats[game].won++;
    
    localStorage.setItem('gameStats_' + currentUser.id, JSON.stringify(stats));
    loadUserStats();
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Modal functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Event listeners for auth
document.getElementById('loginBtn')?.addEventListener('click', openLoginModal);
document.getElementById('signupBtn')?.addEventListener('click', openSignupModal);
document.getElementById('switchToSignup')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModals();
    openSignupModal();
});
document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModals();
    openLoginModal();
});
document.querySelectorAll('.close').forEach(close => {
    close.addEventListener('click', closeModals);
});

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    await login(email, password);
});

document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    await signup(username, email, password);
});

document.getElementById('logoutBtn')?.addEventListener('click', logout);

// Click outside modal to close
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModals();
    }
});
