const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: "gamer"
    },
    profilePic: {
        type: String,
        default: "https://res.cloudinary.com/dvc8kivbh/image/upload/r_max/yucke3fuoj64rpgm6nvv.jpg"
    },
    location: {
        type: String,
        default: "N/A"
    },
    public_id: {
        type: String,
        default: "N/A"
    },
    joined: {
        type: String,
    }
})
module.exports = mongoose.model("User", userSchema);