const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  gamesPlayed: {
    chess: { type: Number, default: 0 },
    sudoku: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    tictactoe: { type: Number, default: 0 },
    snake: { type: Number, default: 0 }
  },
  gamesWon: {
    chess: { type: Number, default: 0 },
    sudoku: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    tictactoe: { type: Number, default: 0 },
    snake: { type: Number, default: 0 }
  },
  totalScore: {
    type: Number,
    default: 0
  },
  achievements: [{
    name: String,
    description: String,
    unlockedAt: Date,
    icon: String
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  streak: {
    type: Number,
    default: 0
  },
  lastPlayed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ totalScore: -1 });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
