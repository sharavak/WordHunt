const mongoose = require('mongoose');
const dataSchema = new mongoose.Schema({
    letters: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true,
        unique: true,
    },
    rank: [{
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        marks: Number,
        rank: Number,
    }],
    words: [String],
    user: [{
        id: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        wordsFound: [String],
        isWin: {
            type: Boolean,
            default: false
        }
    }]

})
module.exports = mongoose.model("Data", dataSchema)