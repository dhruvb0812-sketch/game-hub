// Authentication Module with MongoDB Backend
const API_BASE = '';  // Empty for relative URLs (works with Vercel)

let currentUser = null;
let authToken = null;

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showUserUI();
        
        // Verify token with backend
        verifyToken(token);
        return true;
    } else {
        showAuthUI();
        return false;
    }
}

// Verify token with backend
async function verifyToken(token) {
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!response.ok) {
            // Token invalid, logout
            logout();
        } else {
            // Token valid, load user stats
            loadUserStats();
            loadLeaderboard();
        }
    } catch (error) {
        console.error('Token verification error:', error);
    }
}

// Show logged in UI
function showUserUI() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userSection').style.display = 'flex';
    
    if (currentUser) {
        document.getElementById('usernameDisplay').textContent = currentUser.username || 'User';
        document.getElementById('welcomeName').textContent = currentUser.username || 'Guest';
        
        // Update avatar with first letter
        const avatar = document.getElementById('userAvatar');
        if (avatar && currentUser.username) {
            avatar.innerHTML = currentUser.username.charAt(0).toUpperCase();
            avatar.style.fontWeight = 'bold';
            avatar.style.fontSize = '1.2rem';
        }
    }
}

// Show auth UI
function showAuthUI() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userSection').style.display = 'none';
    document.getElementById('welcomeName').textContent = 'Guest';
}

// Login function
async function login(email, password) {
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return false;
    }
    
    showToast('Logging in...', 'info');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Save token and user data
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showUserUI();
            showToast(`Welcome back, ${data.user.username}! 🎮`, 'success');
            closeModals();
            
            // Load user stats
            await loadUserStats();
            await loadLeaderboard();
            
            // Switch to dashboard
            if (typeof switchGame === 'function') {
                switchGame('dashboard');
            }
            
            return true;
        } else {
            showToast(data.error || 'Login failed. Try demo@example.com / demo123', 'error');
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Network error. Please try again.', 'error');
        return false;
    }
}

// Signup function
async function signup(username, email, password) {
    if (!username || !email || !password) {
        showToast('All fields are required', 'error');
        return false;
    }
    
    if (username.length < 3) {
        showToast('Username must be at least 3 characters', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return false;
    }
    
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
    }
    
    showToast('Creating account...', 'info');
    
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Save token and user data
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showUserUI();
            showToast(`Welcome to GameArena Pro, ${username}! 🎉`, 'success');
            closeModals();
            
            // Load user stats
            await loadUserStats();
            await loadLeaderboard();
            
            // Switch to dashboard
            if (typeof switchGame === 'function') {
                switchGame('dashboard');
            }
            
            return true;
        } else {
            showToast(data.error || 'Signup failed. Please try again.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Signup error:', error);
        showToast('Network error. Please try again.', 'error');
        return false;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    
    showAuthUI();
    showToast('Logged out successfully', 'success');
    
    // Reset dashboard stats
    document.getElementById('totalGames').textContent = '0';
    document.getElementById('totalWins').textContent = '0';
    document.getElementById('winRate').textContent = '0%';
    document.getElementById('streak').textContent = '0';
    
    // Switch to dashboard
    if (typeof switchGame === 'function') {
        switchGame('dashboard');
    }
}

// Load user stats from backend
async function loadUserStats() {
    if (!authToken) return;
    
    try {
        const response = await fetch('/api/games/stats', {
            method: 'GET',
            headers: {
                'x-auth-token': authToken
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
                // Update current user with latest stats
                currentUser = { ...currentUser, ...data.user };
                localStorage.setItem('user', JSON.stringify(currentUser));
                
                // Calculate totals
                const gamesPlayed = data.user.gamesPlayed || {};
                const gamesWon = data.user.gamesWon || {};
                
                const totalGames = Object.values(gamesPlayed).reduce((a, b) => a + b, 0);
                const totalWins = Object.values(gamesWon).reduce((a, b) => a + b, 0);
                const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
                
                // Update UI
                document.getElementById('totalGames').textContent = totalGames;
                document.getElementById('totalWins').textContent = totalWins;
                document.getElementById('winRate').textContent = winRate + '%';
                document.getElementById('streak').textContent = data.user.streak || 0;
                
                // Update welcome message with stats
                const welcomeSpan = document.getElementById('welcomeName');
                if (welcomeSpan && currentUser) {
                    welcomeSpan.textContent = currentUser.username || 'Guest';
                }
                
                // Show achievements if any
                if (data.user.achievements && data.user.achievements.length > 0) {
                    const latestAchievement = data.user.achievements[data.user.achievements.length - 1];
                    const today = new Date().toDateString();
                    const unlockedDate = new Date(latestAchievement.unlockedAt).toDateString();
                    
                    if (unlockedDate === today && !localStorage.getItem('achievement_shown_' + latestAchievement.name)) {
                        showToast(`🏆 Achievement Unlocked: ${latestAchievement.name}!`, 'success');
                        localStorage.setItem('achievement_shown_' + latestAchievement.name, 'true');
                    }
                }
                
                return data;
            }
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
    return null;
}

// Load leaderboard
async function loadLeaderboard(gameType = 'all') {
    try {
        const response = await fetch(`/api/games/leaderboard?game=${gameType}&limit=10`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.leaderboard) {
                updateLeaderboardUI(data.leaderboard);
                return data.leaderboard;
            }
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
    return [];
}

// Update leaderboard UI
function updateLeaderboardUI(leaderboard) {
    const leaderboardDiv = document.getElementById('leaderboard');
    if (!leaderboardDiv) return;
    
    if (leaderboard.length === 0) {
        leaderboardDiv.innerHTML = `
            <div class="leaderboard-item">
                <span class="rank">-</span>
                <span class="name">No players yet</span>
                <span class="score">0 pts</span>
            </div>
        `;
        return;
    }
    
    leaderboardDiv.innerHTML = leaderboard.map(player => `
        <div class="leaderboard-item">
            <span class="rank">${player.rank}</span>
            <span class="name">
                ${player.username}
                ${player.username === (currentUser?.username) ? ' (You)' : ''}
            </span>
            <span class="score">${player.score} pts</span>
        </div>
    `).join('');
}

// Update game stats (called after each game)
async function updateGameStats(game, won, score = 0, duration = 0, moves = 0, difficulty = 'medium') {
    if (!currentUser || !authToken) {
        // Guest mode - store locally only
        updateGuestStats(game, won);
        return false;
    }
    
    try {
        const response = await fetch('/api/games/stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': authToken
            },
            body: JSON.stringify({
                game,
                won,
                score,
                duration,
                moves,
                difficulty
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update local user data
            if (currentUser) {
                if (data.gamesPlayed) currentUser.gamesPlayed = data.gamesPlayed;
                if (data.gamesWon) currentUser.gamesWon = data.gamesWon;
                if (data.totalScore) currentUser.totalScore = data.totalScore;
                if (data.streak) currentUser.streak = data.streak;
                
                localStorage.setItem('user', JSON.stringify(currentUser));
            }
            
            // Show new achievements
            if (data.newAchievements && data.newAchievements.length > 0) {
                for (const achievement of data.newAchievements) {
                    showToast(`🏆 Achievement Unlocked: ${achievement.name}! ${achievement.description}`, 'success');
                }
            }
            
            // Show points earned
            if (data.pointsEarned && data.pointsEarned > 0) {
                showToast(`+${data.pointsEarned} points earned!`, 'success');
            }
            
            // Reload stats
            await loadUserStats();
            await loadLeaderboard();
            
            return data;
        }
    } catch (error) {
        console.error('Error updating stats:', error);
        // Fallback to local storage
        updateGuestStats(game, won);
    }
    return null;
}

// Guest mode stats (local storage)
function updateGuestStats(game, won) {
    const guestStats = JSON.parse(localStorage.getItem('guestStats') || '{}');
    if (!guestStats[game]) guestStats[game] = { played: 0, won: 0 };
    
    guestStats[game].played++;
    if (won) guestStats[game].won++;
    
    localStorage.setItem('guestStats', JSON.stringify(guestStats));
    
    // Update dashboard for guest
    const totalGames = Object.values(guestStats).reduce((a, b) => a + b.played, 0);
    const totalWins = Object.values(guestStats).reduce((a, b) => a + b.won, 0);
    const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
    
    document.getElementById('totalGames').textContent = totalGames;
    document.getElementById('totalWins').textContent = totalWins;
    document.getElementById('winRate').textContent = winRate + '%';
}

// Save game session
async function saveGameSession(game, duration, score, won, difficulty, moves, gameData = {}) {
    if (!currentUser || !authToken) return;
    
    try {
        const response = await fetch('/api/games/save-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': authToken
            },
            body: JSON.stringify({
                game,
                duration,
                score,
                won,
                difficulty,
                moves,
                gameData
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error saving session:', error);
        return false;
    }
}

// Load user profile
async function loadUserProfile() {
    if (!authToken) return null;
    
    try {
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: {
                'x-auth-token': authToken
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                return data.profile;
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
    return null;
}

// Show user profile modal
async function showUserProfile() {
    const profile = await loadUserProfile();
    if (!profile) return;
    
    // Create or update profile modal
    let profileModal = document.getElementById('profileModal');
    if (!profileModal) {
        profileModal = document.createElement('div');
        profileModal.id = 'profileModal';
        profileModal.className = 'modal';
        document.body.appendChild(profileModal);
    }
    
    profileModal.innerHTML = `
        <div class="modal-content glass-card" style="max-width: 500px;">
            <span class="close" onclick="document.getElementById('profileModal').style.display='none'">&times;</span>
            <h2><i class="fas fa-user-circle"></i> ${profile.username}</h2>
            <div class="profile-stats">
                <div class="stat-row">
                    <span>Member since:</span>
                    <strong>${new Date(profile.joinedDate).toLocaleDateString()}</strong>
                </div>
                <div class="stat-row">
                    <span>Total Games:</span>
                    <strong>${profile.stats.totalGames}</strong>
                </div>
                <div class="stat-row">
                    <span>Total Wins:</span>
                    <strong>${profile.stats.totalWins}</strong>
                </div>
                <div class="stat-row">
                    <span>Win Rate:</span>
                    <strong>${profile.stats.totalGames > 0 ? Math.round((profile.stats.totalWins / profile.stats.totalGames) * 100) : 0}%</strong>
                </div>
                <div class="stat-row">
                    <span>Total Score:</span>
                    <strong>${profile.stats.totalScore} pts</strong>
                </div>
                <div class="stat-row">
                    <span>Current Streak:</span>
                    <strong>${profile.stats.streak} days 🔥</strong>
                </div>
            </div>
            
            <h3><i class="fas fa-trophy"></i> Achievements</h3>
            <div class="achievements-list">
                ${profile.achievements && profile.achievements.length > 0 ? 
                    profile.achievements.map(ach => `
                        <div class="achievement-item">
                            <span class="achievement-icon">${ach.icon || '🏆'}</span>
                            <div class="achievement-info">
                                <strong>${ach.name}</strong>
                                <small>${ach.description}</small>
                            </div>
                        </div>
                    `).join('') : 
                    '<p>No achievements yet. Play games to unlock!</p>'
                }
            </div>
            
            <button class="btn-outline full-width" onclick="document.getElementById('profileModal').style.display='none'">Close</button>
        </div>
    `;
    
    profileModal.style.display = 'block';
    
    // Add close functionality
    const closeBtn = profileModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => profileModal.style.display = 'none';
    }
    
    window.onclick = (event) => {
        if (event.target === profileModal) {
            profileModal.style.display = 'none';
        }
    };
}

// Show toast notification
function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Modal functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'block';
}

function openSignupModal() {
    const modal = document.getElementById('signupModal');
    if (modal) modal.style.display = 'block';
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Event listeners for auth
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userAvatar = document.getElementById('userAvatar');
    
    if (loginBtn) loginBtn.addEventListener('click', openLoginModal);
    if (signupBtn) signupBtn.addEventListener('click', openSignupModal);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (userAvatar) userAvatar.addEventListener('click', showUserProfile);
    
    // Modal switch links
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            closeModals();
            openSignupModal();
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModals();
            openLoginModal();
        });
    }
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            await login(email, password);
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            await signup(username, email, password);
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Initialize auth check
    checkAuth();
});

// Export functions for use in other files
window.login = login;
window.signup = signup;
window.logout = logout;
window.updateGameStats = updateGameStats;
window.saveGameSession = saveGameSession;
window.loadUserStats = loadUserStats;
window.loadLeaderboard = loadLeaderboard;
window.showToast = showToast;
window.currentUser = () => currentUser;
window.authToken = () => authToken;
