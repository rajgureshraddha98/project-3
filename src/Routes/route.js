const express = require("express");
const router = express.Router();

const midW = require("../middlewares/auth");
const booksController = require("../controllers/booksController");
const reviewsController = require("../controllers/reviewsController");
const userController = require("../controllers/userController");

//User APIs.
router.post("/register", userController.createUser);

router.post("/login", userController.userLogin);

//Books APIs.
router.post(
  "/books",
  midW.authentication,
  midW.authorisation,
  booksController.createBook
); //midW.auth,

router.get("/books", midW.authentication, booksController.getBooks);

router.get("/books/:bookId", midW.authentication, booksController.getBookById);

router.put(
  "/books/:bookId",
  midW.authentication,
  midW.authorisation,
  booksController.updateBookById
);

router.delete(
  "/books/:bookId",
  midW.authentication,
  midW.authorisation,
  booksController.deleteBookById
);

//Reviews APIs.
router.post("/books/:bookId/review", reviewsController.createReview);

router.put("/books/:bookId/review/:reviewId", reviewsController.updateReview);

router.delete(
  "/books/:bookId/review/:reviewId",
  reviewsController.deleteReviewById
);

// If Invalid API requested.
router.all("/**", function (req, res) {
  res.status(400).send({
    status: false,
    message: "INVALID END-POINT: The API You requested is NOT available.",
  });
});

module.exports = router;
