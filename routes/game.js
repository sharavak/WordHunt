const express = require('express');
const gameRouter = require("../controllers/gameRouter")
const router = express.Router();
const { isSign } = require('../middleware')
router.get('/ranking', isSign, gameRouter.ranking);
router.get('/game', isSign, gameRouter.game);
router.get('/leaderboard', gameRouter.renderLeaderBoard)
router.get('/', (req, res) => {
    return res.render("home");
})
module.exports = router;