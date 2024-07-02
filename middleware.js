module.exports.isSign = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "Please sign in first");
        return res.redirect('/');
    }
    next();
}
module.exports.isAuthForApi = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "Unauthorized" }).status(404);
    }
    next();
}