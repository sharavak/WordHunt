const mongoose = require('mongoose')
const userStats = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    maxMarks: {
        type: Number,
        default: 0
    },
    maxRank: {
        type: Number,
        default: 0
    },
    gamesPlayed: {
        type: Number,
        default: 0
    },
    totalScore: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('UserStats', userStats);