const reviewsModel = require("../models/reviewsModel");
const booksModel = require("../models/booksModel");
const validator = require("../utils/validator");

/*--------------------------------------------------------------------------------*/
//                           1. API - CREATE A REVIEW BY BOOK-ID.
/*--------------------------------------------------------------------------------*/

const createReview = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    if (!bookId) {
      return res
        .status(400)
        .send({ status: false, message: "BookId NOT given in Params." });
    }
    if (!validator.isValidObjectId(bookId)) {
      return res.status(400).send({
        status: false,
        message: "BookID NOT a Valid Mongoose ObjectId.",
      });
    }

    const book = await booksModel.findOne({ _id: bookId, isDeleted: false });
    if (!book) {
      return res
        .status(404)
        .send({ status: false, message: "Book NOT Found." });
    }

    let requestBody = req.body;

    // Error: No Data in Request-Body.
    if (Object.keys(requestBody).length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid Request. Please input data in the body.",
      });
    }

    let { reviewedBy, review, rating } = requestBody;

    //ReviewedBy Validation.
    if (reviewedBy) {
      if (!validator.isValidString(reviewedBy)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid ReviewedBy." });
      }
      if (!/^[a-zA-Z ]*$/.test(reviewedBy)) {
        return res.status(400).send({
          status: false,
          message: "ReviewedBy (NAME) can ONLY be Alphabets & White-space(s).",
        });
      }
    } else {
      reviewedBy = "Guest";
    }
    //RATING Validation.
    if (!validator.isValidRating(rating)) {
      return res.status(400).send({
        status: false,
        message: "RATING Required(NUMBER between 1 to 5 ONLY).",
      });
    }

    //REVIEW (Optional) Validation.
    if (!validator.isValidReview(review)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter a valid REVIEW." });
    }

    //Increase Review-Count in Book's Document.
    const incReviewsCount = await booksModel.findOneAndUpdate(
      { _id: bookId },
      { $inc: { reviews: 1 } },
      { new: true }
    );

    requestBody.bookId = bookId;

    //Create Review.
    const reviewCreated = await reviewsModel.create(requestBody);

    //Show Book-document with created Review.
    const finalData = {
      ...incReviewsCount.toObject(),
      reviewsData: reviewCreated,
    };

    return res.status(201).send({
      status: true,
      message: "Created Review Successfully.",
      data: finalData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

/*--------------------------------------------------------------------------------*/
//                     2. API - UPDATE A REVIEW OF BOOK BY REVIEW-ID.
/*--------------------------------------------------------------------------------*/

const updateReview = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    if (!bookId) {
      return res
        .status(400)
        .send({ status: false, message: "BookID NOT given in Params." });
    }
    if (!validator.isValidObjectId(bookId)) {
      return res.status(400).send({
        status: false,
        message: "BookID NOT a Valid Mongoose ObjectId.",
      });
    }

    const reviewId = req.params.reviewId;
    if (!reviewId) {
      return res
        .status(400)
        .send({ status: false, message: "ReviewID NOT given in Params." });
    }
    if (!validator.isValidObjectId(reviewId)) {
      return res.status(400).send({
        status: false,
        message: "ReviewID NOT a Valid Mongoose ObjectId.",
      });
    }

    let requestBody = req.body;
    // Error: No Data in Request-Body.
    if (Object.keys(requestBody).length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid Request. Please input data in the body.",
      });
    }

    //Find Book by BookID.
    const bookFound = await booksModel.findOne({
      _id: bookId,
      isDeleted: false,
    });
    if (!bookFound) {
      return res
        .status(404)
        .send({ status: false, message: "Book NOT Found." });
    }

    //Find Review by ReviewID.
    const reviewFound = await reviewsModel.findOne({
      _id: reviewId,
      isDeleted: false,
      bookId: bookId, //'bookId' & 'reviewId' of Same Document.
    });
    if (!reviewFound) {
      return res.status(404).send({
        status: false,
        message:
          "Review NOT Found (either Deleted OR <bookId & reviewId must be of SAME BOOK.>).",
      });
    }

    //Get Review Details from req.body
    let { review, rating, reviewedBy } = requestBody;

    //REVIEWED-BY Validation.
    if (reviewedBy) {
      if (!validator.isValidString(reviewedBy)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid REVIEWED-BY." });
      }
      if (!/^[a-zA-Z ]*$/.test(reviewedBy)) {
        return res.status(400).send({
          status: false,
          message: "REVIEWED-BY can ONLY be Alphabets & White-space(s).",
        });
      }
    }

    //RATING Validation.
    if (rating) {
      if (!validator.isValidRating(rating)) {
        return res.status(400).send({
          status: false,
          message: "Invalid RATING: NUMBER between 1 to 5 ONLY.",
        });
      }
    }

    //Filter.
    let filter;

    //Update Review.
    if (review && rating && reviewedBy) {
      filter = { review, rating, reviewedBy };
    } else if (review && rating) {
      filter = { review, rating };
    } else if (review && reviewedBy) {
      filter = { review, reviewedBy };
    } else if (rating && reviewedBy) {
      filter = { rating, reviewedBy };
    } else if (review) {
      filter = { review };
    } else if (rating) {
      filter = { rating };
    } else if (reviewedBy) {
      filter = { reviewedBy };
    } else {
      return res.status(400).send({
        status: false,
        message: "Provide <review, rating OR reviewedBy> in Body.",
      });
    }

    // Update Review.
    const updatedReview = await reviewsModel.findOneAndUpdate(
      { _id: reviewId, isDeleted: false },
      { $set: filter },
      { new: true }
    );

    //Show Book-document with Updated-Review.
    const finalData = { ...bookFound.toObject(), reviewsData: updatedReview };

    // Successful Response.
    return res.status(200).send({
      status: true,
      message: "Review Updated Successfully.",
      data: finalData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

/*--------------------------------------------------------------------------------*/
//                           3. API - DELETE A REVIEW OF BOOK BY REVIEW-ID.
/*--------------------------------------------------------------------------------*/

const deleteReviewById = async (req, res) => {
  try {
    // <bookId> Validation.
    const bookId = req.params.bookId;
    if (!bookId) {
      return res
        .status(400)
        .send({ status: false, message: "BookID NOT given in Params." });
    }
    if (!validator.isValidObjectId(bookId)) {
      return res.status(400).send({
        status: false,
        message: "BookID NOT a Valid Mongoose ObjectId.",
      });
    }

    // <reviewId> Validation.
    const reviewId = req.params.reviewId;
    if (!reviewId) {
      return res
        .status(400)
        .send({ status: false, message: "ReviewID NOT given in Params." });
    }
    if (!validator.isValidObjectId(reviewId)) {
      return res.status(400).send({
        status: false,
        message: "ReviewID NOT a Valid Mongoose ObjectId.",
      });
    }

    //Find Book by BookID.
    const bookFound = await booksModel.findOne({
      _id: bookId,
      isDeleted: false,
    });
    if (!bookFound) {
      return res
        .status(404)
        .send({ status: false, message: "Book NOT Found." });
    }

    //Find Review by ReviewID.
    const reviewFound = await reviewsModel.findOneAndUpdate(
      {
        _id: reviewId,
        isDeleted: false,
        bookId: bookId, //'bookId' & 'reviewId' of Same Document.
      },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!reviewFound) {
      return res.status(404).send({
        status: false,
        message:
          "Review NOT Found (either already Deleted <OR> <bookId & reviewId must be of SAME BOOK.>).",
      });
    }

    //Decrease Reviews-count in Book.
    const decBookCount = await booksModel.findOneAndUpdate(
      {
        _id: bookId,
        isDeleted: false,
      },
      { $inc: { reviews: -1 } },
      { new: true }
    );

    // Successful Response.
    return res.status(200).send({
      status: true,
      message: "Review Deleted Successfully.",
    });
    // data: reviewFound,
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReviewById,
};
