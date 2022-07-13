const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewsSchema = new mongoose.Schema({
  bookId: {
    type: ObjectId,
    required: true,
    ref: "Book",
  },

  reviewedBy: {
    type: String,
    required: true,
    trim: true,
    default: "Guest", // Reviewer's Name (if Not Given).
  },

  reviewedAt: {
    type: Date,
    default: new Date(),
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
  },

  review: {
    type: String,
    trim: true,
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Review", reviewsSchema); //Collection Name- reviews.
