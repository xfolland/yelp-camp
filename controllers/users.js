const User = require("../models/User");

module.exports.getLogin = (req, res) => {
    res.render("users/login");
}

module.exports.getRegister = (req, res) => {
    res.render("users/register");
}

module.exports.loginUser = (req, res) => {
    req.flash("success", "Successfully logged in!");
    const url = req.session.originalUrl || "/campgrounds";
    delete req.session.originalUrl;
    res.redirect(url);
}

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash("success", "Successfully logged out!");
    res.redirect("/campgrounds");
}

module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const u = new User({ email, username });
        const user = await User.register(u, password);
        req.login(user, (e) => {
            if (e) return next(e);
            req.flash("success", "Welcome to yelpcamp");
            res.redirect("/campgrounds");
        });
    } catch (e) {
        req.flash("error", "Unable to register with that username or email");
        return res.redirect("/register");
    }
}
