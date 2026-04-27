const mongoose = require('mongoose');

const GameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game: {
    type: String,
    enum: ['chess', 'sudoku', 'memory', 'tictactoe', 'snake'],
    required: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  won: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert', 'ai', 'human'],
    default: 'medium'
  },
  moves: {
    type: Number,
    default: 0
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

GameSessionSchema.index({ userId: 1, playedAt: -1 });
GameSessionSchema.index({ game: 1, score: -1 });

module.exports = mongoose.models.GameSession || mongoose.model('GameSession', GameSessionSchema);
