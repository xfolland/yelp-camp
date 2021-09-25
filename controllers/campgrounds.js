const Campground = require("../models/Campground");
const { cloudinary } = require("../cloudinary");
if (process.env.NODE_ENV !== "production") require("dotenv").config();

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.addNewCampground = async (req, res) => {
    const { title, location, description, price } = req.body;
    const geoData = await geocoder.forwardGeocode({ query: location, limit: 1 }).send();
    const geometry = geoData.body.features[0].geometry;
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    const campground = new Campground({ author: req.user._id, title, location, geometry, images, description, price });
    await campground.save();
    req.flash("success", "Successfully added a new campground!");
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    campground.images.map((image) => cloudinary.uploader.destroy(image.filename));
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
}

module.exports.getEdit = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
}

module.exports.getIndex = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.getNew = async (req, res) => {
    res.render("campgrounds/new");
}

module.exports.getShow = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
                select: "username"
            }
        })
        .populate("author", "username");
    if (!campground) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}

module.exports.redirectShow = (req, res) => {
    const { id } = req.params;
    res.redirect(`/campgrounds/${id}`);
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const { title, location, description, price } = req.body;
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    const campground = await Campground.findByIdAndUpdate(id, { author: req.user._id, title, location, description, price });
    console.log(req.body);
    campground.images.push(...images);
    campground.save();
    if (req.body.deleteImages) {
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        for (let filename of req.body.deleteImages) cloudinary.uploader.destroy(filename);
    }
    req.flash("success", `Successfully updated the campground!`);
    res.redirect(`/campgrounds/${id}`);
}
