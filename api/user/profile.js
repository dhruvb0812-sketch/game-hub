const jwt = require('jsonwebtoken');
const connectDB = require('../db/connect');
const User = require('../models/User');
const GameSession = require('../models/GameSession');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-auth-token'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const token = req.headers['x-auth-token'];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's game history
    const gameHistory = await GameSession.find({ userId: user._id })
      .sort({ playedAt: -1 })
      .limit(20);

    // Calculate win rates
    const winRates = {};
    const games = ['chess', 'sudoku', 'memory', 'tictactoe', 'snake'];
    
    for (const game of games) {
      const played = user.gamesPlayed[game] || 0;
      const won = user.gamesWon[game] || 0;
      winRates[game] = played > 0 ? Math.round((won / played) * 100) : 0;
    }

    res.status(200).json({
      success: true,
      profile: {
        username: user.username,
        email: user.email,
        joinedDate: user.createdAt,
        lastActive: user.lastLogin,
        stats: {
          totalGames: Object.values(user.gamesPlayed).reduce((a, b) => a + b, 0),
          totalWins: Object.values(user.gamesWon).reduce((a, b) => a + b, 0),
          totalScore: user.totalScore,
          streak: user.streak,
          winRates
        },
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        achievements: user.achievements,
        recentGames: gameHistory
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
