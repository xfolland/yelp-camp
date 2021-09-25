const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    body: {
        type: String
    },
    rating: {
        type: Number
    },

});

module.exports = mongoose.model("Review", ReviewSchema);
