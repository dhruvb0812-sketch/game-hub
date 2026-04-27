const connectDB = require('../db/connect');
const User = require('../models/User');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
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
    
    const gameType = req.query.game || 'all';
    const limit = parseInt(req.query.limit) || 10;
    
    let sortField = {};
    
    if (gameType === 'all') {
      sortField = { totalScore: -1 };
    } else {
      // For specific game leaderboard
      sortField = { [`gamesWon.${gameType}`]: -1 };
    }
    
    const leaderboard = await User.find({})
      .select('username gamesPlayed gamesWon totalScore')
      .sort(sortField)
      .limit(limit);
    
    // Format leaderboard data
    const formattedLeaderboard = leaderboard.map((user, index) => {
      let score;
      if (gameType === 'all') {
        score = user.totalScore;
      } else {
        score = user.gamesWon[gameType] || 0;
      }
      
      return {
        rank: index + 1,
        username: user.username,
        score: score,
        gamesPlayed: Object.values(user.gamesPlayed).reduce((a, b) => a + b, 0),
        wins: Object.values(user.gamesWon).reduce((a, b) => a + b, 0),
        gameStats: gameType !== 'all' ? {
          played: user.gamesPlayed[gameType] || 0,
          won: user.gamesWon[gameType] || 0
        } : null
      };
    });
    
    res.status(200).json({
      success: true,
      gameType,
      leaderboard: formattedLeaderboard,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
