const express = require('express')
const multer = require("multer");
const { isSign } = require('../middleware')
const upload = multer();
const gameRouter = require('../controllers/gameRouter')
const router = express.Router()

router.get('/:id', gameRouter.renderProfile);
router.post('/:id', isSign, upload.single('profilePic'), gameRouter.editProfile);
module.exports = router;