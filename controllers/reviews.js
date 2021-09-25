const Campground = require("../models/Campground");
const Review = require("../models/Review");

module.exports.deleteReview = async (req, res) => {
    const { cid, rid } = req.params;
    await Campground.findByIdAndUpdate(cid, { $pull: { reviews: rid } });
    await Review.findByIdAndDelete(rid);
    req.flash("success", "Successfully deleted a review!");
    res.redirect(`/campgrounds/${cid}`);
}

module.exports.postReview = async (req, res) => {
    const { cid } = req.params;
    const { body, rating } = req.body;
    const campground = await Campground.findById(cid);
    const review = new Review({ author: req.user._id, body, rating });
    await review.save();
    campground.reviews.push(review);
    await campground.save();
    req.flash("success", "Successfully added a review!");
    res.redirect(`/campgrounds/${cid}`);
}
