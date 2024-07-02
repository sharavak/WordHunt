const express = require('express');
const authRouter = require("../controllers/authRouter");
const router = express.Router();

router.get('/logout', authRouter.signout);
module.exports = router;