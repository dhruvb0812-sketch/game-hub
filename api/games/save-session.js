const jwt = require('jsonwebtoken');
const connectDB = require('../db/connect');
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

  if (req.method !== 'POST') {
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

    const { game, duration, score, won, difficulty, moves, gameData } = req.body;

    const session = new GameSession({
      userId: decoded.userId,
      game,
      duration: duration || 0,
      score: score || 0,
      won: won || false,
      difficulty: difficulty || 'medium',
      moves: moves || 0
    });

    await session.save();

    res.status(200).json({
      success: true,
      sessionId: session._id,
      message: 'Game session saved successfully'
    });
  } catch (error) {
    console.error('Save session error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
