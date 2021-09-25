const catchAsync = require("../utils/catchAsync");
const express = require("express");
const reviews = require("../controllers/reviews");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.postReview));

router.delete("/:rid", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
