const jwt = require('jsonwebtoken');
const connectDB = require('../db/connect');
const User = require('../models/User');
const GameSession = require('../models/GameSession');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-auth-token'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
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

    if (req.method === 'GET') {
      // Get user stats
      const recentSessions = await GameSession.find({ userId: user._id })
        .sort({ playedAt: -1 })
        .limit(10);

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          gamesPlayed: user.gamesPlayed,
          gamesWon: user.gamesWon,
          totalScore: user.totalScore,
          streak: user.streak,
          achievements: user.achievements,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        recentSessions
      });
    } 
    else if (req.method === 'POST') {
      // Update game stats
      const { game, won, score = 0, duration = 0, moves = 0, difficulty = 'medium' } = req.body;

      if (!game || !user.gamesPlayed[game]) {
        return res.status(400).json({ error: 'Invalid game' });
      }

      // Update user stats
      user.gamesPlayed[game]++;
      if (won) {
        user.gamesWon[game]++;
      }
      
      // Update total score (100 points for win, 50 for participation)
      let pointsEarned = 50;
      if (won) pointsEarned += 50;
      if (score > 0) pointsEarned += Math.floor(score / 10);
      user.totalScore += pointsEarned;
      
      // Update streak
      const lastPlayedDate = user.lastPlayed ? new Date(user.lastPlayed) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (lastPlayedDate) {
        const lastDate = new Date(lastPlayedDate);
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          user.streak++;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
      } else {
        user.streak = 1;
      }
      
      user.lastPlayed = new Date();
      await user.save();

      // Save game session
      const session = new GameSession({
        userId: user._id,
        game,
        duration,
        score: pointsEarned,
        won,
        difficulty,
        moves
      });
      await session.save();

      // Check for achievements
      const achievements = [];
      
      // First win achievement
      if (won && Object.values(user.gamesWon).reduce((a, b) => a + b, 0) === 1) {
        achievements.push({
          name: 'First Victory!',
          description: 'Won your first game',
          icon: '🏆'
        });
      }
      
      // 10 games played
      const totalGames = Object.values(user.gamesPlayed).reduce((a, b) => a + b, 0);
      if (totalGames === 10) {
        achievements.push({
          name: 'Getting Started',
          description: 'Played 10 games',
          icon: '🎯'
        });
      }
      
      // 10 wins
      const totalWins = Object.values(user.gamesWon).reduce((a, b) => a + b, 0);
      if (totalWins === 10) {
        achievements.push({
          name: 'Rising Star',
          description: 'Won 10 games',
          icon: '⭐'
        });
      }
      
      // 7 day streak
      if (user.streak === 7) {
        achievements.push({
          name: 'Weekly Warrior',
          description: '7 day playing streak',
          icon: '📅'
        });
      }
      
      // Add new achievements
      for (const achievement of achievements) {
        const exists = user.achievements.some(a => a.name === achievement.name);
        if (!exists) {
          user.achievements.push({
            name: achievement.name,
            description: achievement.description,
            unlockedAt: new Date(),
            icon: achievement.icon
          });
        }
      }
      
      if (achievements.length > 0) {
        await user.save();
      }

      res.status(200).json({
        success: true,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        totalScore: user.totalScore,
        streak: user.streak,
        pointsEarned,
        newAchievements: achievements
      });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
