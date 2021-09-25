const mongoose = require("mongoose");
const Review = require("./Review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: {
        type: String
    },
    filename: {
        type: String
    }
});

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [ImageSchema],
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
}, { toJSON: { virtuals: true } });

CampgroundSchema.virtual("properties.popup").get(function () {
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) await Review.deleteMany({ _id: { $in: doc.reviews } });
});

module.exports = mongoose.model("Campground", CampgroundSchema);
