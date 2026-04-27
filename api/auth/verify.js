const jwt = require('jsonwebtoken');
const connectDB = require('../db/connect');
const User = require('../models/User');

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

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use GET method.' 
    });
  }

  try {
    // Get token from header
    const token = req.headers['x-auth-token'];

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided. Please login again.' 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          error: 'Token has expired. Please login again.' 
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid token. Please login again.' 
        });
      }
      throw error;
    }

    // Connect to database
    await connectDB();

    // Find user by id from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found. Please login again.' 
      });
    }

    // Check if user is active/banned (optional)
    if (user.isBanned) {
      return res.status(403).json({ 
        success: false,
        error: 'Your account has been suspended. Contact support.' 
      });
    }

    // Update last active timestamp (optional)
    user.lastActive = new Date();
    await user.save();

    // Return success with user data
    res.status(200).json({
      success: true,
      valid: true,
      userId: user._id,
      username: user.username,
      email: user.email,
      message: 'Token is valid',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        totalScore: user.totalScore,
        streak: user.streak,
        achievements: user.achievements
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
