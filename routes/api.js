const express = require('express');
const app = express();
const initRouter = require("../controllers/initRouter");
const checkRouter = require('../controllers/checkRouter');
const { isAuthForApi } = require('../middleware');

app.use('/init/', isAuthForApi, initRouter);
app.use('/check/', isAuthForApi, checkRouter);
module.exports = app;