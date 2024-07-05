const cache = require('../cache');
const Data = require('../models/data');
const UserStats = require("../models/stats");
const User = require('../models/user');
const cloudinary = require('cloudinary');
if (process.env.Node_ENV !== 'production') {
    require('dotenv').config();
}
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
});
const { getYesterdayDate, convertTime } = require('../utils/dateTime');

module.exports.game = async (req, res) => {
    let date = convertTime();
    if (cache.get('newDay') !== undefined)
        return res.render('game', { data: cache.get('newDay'), user_id: req.user._id })
    const newDay = await Data.findOne({ date: date }, { letters: 1 });
    cache.set('newDay', newDay.letters);
    return res.render("game", { data: newDay.letters, user_id: req.user._id });
}
module.exports.ranking = async (req, res) => {
    try {
        let yest = getYesterdayDate();
        if (cache.get('rank') !== undefined)
            return res.render('ranking', { data: cache.get('rank'), date: yest, user_id: req.user._id });
        let datas = await Data.findOne({ date: getYesterdayDate() }, { rank: 1 }).populate({ path: 'rank', populate: { path: 'user' } })

        cache.set('rank', datas.rank);
        return res.render('ranking', { data: datas.rank, date: yest, user_id: req.user._id });
    } catch {
        req.flash("error", 'Please Sign in first!!!');
        return res.redirect("/");
    }
}
module.exports.renderProfile = async (req, res) => {
    let isUser = false;
    let isAuth = req.isAuthenticated();
    const stats = await UserStats.findOne({ user: req.params.id }).populate("user")
    if (req.user && req.user._id === req.params.id) isUser = true;
    res.render('profile', { stats: stats, isUser: isUser, isAuth: isAuth, user_id: req.user ? req.user._id : stats.user._id });
}
module.exports.editProfile = async (req, res) => {
    const user = await User.findOne({ _id: req.user._id })
    if (req.file !== undefined) {
        if (user.public_id !== 'N/A')
            cloudinary.v2.uploader.destroy(user.public_id);
        const uploadResult = await new Promise((resolve) => {
            cloudinary.v2.uploader.upload_stream({ folder: "WordHunt" }, (error, uploadResult) => {
                return resolve(uploadResult);
            }).end(req.file.buffer);
        });
        user.profilePic = uploadResult.secure_url;
        user.public_id = uploadResult.public_id;
    }
    user.location = req.body.location || 'N/A'
    user.name = req.body.name || user.name;
    await user.save();
    req.flash("success", "Profile Updated Successfully!!!")
    res.redirect(`/profile/${req.params.id}`);
}

module.exports.renderLeaderBoard = async (req, res) => {
    const stats = await UserStats.find().populate('user');
    console.log(cache.get('stats'));
    if (cache.get('stats') !== undefined)
        return res.render('leaderboard', { stats: cache.get('stats') })
    stats.sort((a, b) => a.rank - b.rank)
    cache.set('stats', stats);
    return res.render('leaderboard', { stats: stats })

}