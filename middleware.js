const Campground = require("./models/Campground");
const Review = require("./models/Review");
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("./schemas");

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You are not authorized to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    return next();
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.originalUrl = req.originalUrl;
        req.flash("error", "You must be logged in to do that");
        return res.redirect("/login");
    }
    return next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { cid, rid } = req.params;
    const review = await Review.findById(rid);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not authorized to do that");
        return res.redirect(`/campgrounds/${cid}`);
    }
    return next();
}

module.exports.validateCampground = (req, res, next) => {
    const validation = campgroundSchema.validate(req.body);
    if (validation.error) throw new ExpressError(validation.error.details.map(el => el.message).join(","), 400);
    return next();
}

module.exports.validateReview = (req, res, next) => {
    const validation = reviewSchema.validate(req.body);
    if (validation.error) throw new ExpressError(validation.error.details.map(el => el.message).join(","), 400);
    return next();
}
