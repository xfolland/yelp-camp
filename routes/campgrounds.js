const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const { isAuthor, isLoggedIn, validateCampground } = require("../middleware");

const { storage } = require("../cloudinary");
const upload = multer({ storage });

router.route("/")
    .get(catchAsync(campgrounds.getIndex))
    .post(isLoggedIn, upload.array("images"), validateCampground, catchAsync(campgrounds.addNewCampground));

router.get("/new", isLoggedIn, catchAsync(campgrounds.getNew));

router.route("/:id")
    .get(catchAsync(campgrounds.getShow))
    .put(isLoggedIn, isAuthor, upload.array("images"), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.getEdit));

// fix for when redirecting when trying to post or delete review
router.get("/:id/reviews", campgrounds.redirectShow);
router.get("/:id/reviews/*", campgrounds.redirectShow);

module.exports = router;
