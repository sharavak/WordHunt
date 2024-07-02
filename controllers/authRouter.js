module.exports.signout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            req.flash("error", "Please sign in first");
            return res.redirect('/');
        }
        req.flash("success", "Successfully logged out")
        return res.redirect('/');
    });
}