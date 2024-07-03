const express = require('express');
const app = express();
const path = require('path');
const mongoose = require("mongoose");
const passport = require("passport");
const session = require('express-session')
const cors = require('cors');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const apiRouter = require('./routes/api');
const game = require('./routes/game');
const auth = require('./routes/auth');
const profile = require('./routes/profile')
const { convertTime } = require("./utils/dateTime");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user");
const UserStats = require("./models/stats");
const cron = require('./schedule');

if (process.env.Node_ENV !== 'production') {
    require('dotenv').config();
}
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors({ origin: 'https://wordhunt.azurewebsites.net' }));
app.use(flash());

const dbURL = process.env.DBURL || "mongodb://127.0.0.1:27017/wordDB"

app.use(
    session({
        secret: process.env.SECRET,
        name: "avail",
        store: MongoStore.create({
            mongoUrl: dbURL,
        }),
        cookie: {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        },
        resave: false,
        saveUninitialized: false,

    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(dbURL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Database Connected');
})

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


passport.use(
    new GoogleStrategy({
        clientID: process.env.CLIENTID,
        clientSecret: process.env.CLIENTSECRET,
        callbackURL: "https://wordhunt.azurewebsites.net/auth/google/callback",
        passReqToCallback: true,
    },
        async function (request, accessToken, refreshToken, profile, done) {
            const exist = await User.findOne({ email: profile["emails"][0].value });
            if (!exist) {
                const user = await User.create({ email: profile["emails"][0].value, name: profile._json.name, profilePic: profile._json.picture, joined: convertTime() });
                const userStats = new UserStats({ user: user._id });
                await userStats.save();
                await user.save();
            }
            const user = await User.findOne({ email: profile["emails"][0].value });
            return done(null, user);
        }
    )
)

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.get('/auth/google', passport.authenticate("google", {
    scope: ["email", "profile"],
}))
app.get("/auth/google/callback",
    passport.authenticate("google", {
        access_type: "offline",
        scope: ["email", "profile"],
    }),
    (req, res) => {
        if (!req.user) {
            console.log(req.user, 'usefrsrf', 'error')
            req.flash("error", "Error")
            return res.redirect('/')
        }
        req.flash("success", "Welcome back!!!");
        return res.redirect('/game');
    }
);


app.use('/', game);
app.use('/profile', profile);
app.use('/api/', apiRouter);
app.use('/', auth);

app.all('*', (req, res) => {
    res.json({ error: "No page exists" }).status(404);
})
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on ${port} `);
})