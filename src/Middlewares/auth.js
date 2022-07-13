const jwt = require("jsonwebtoken");
const booksModel = require("../models/booksModel");
const validator = require("../utils/validator");

/*--------------------------------------------------------------------------------*/
//                            1. Authentication
/*--------------------------------------------------------------------------------*/

const authentication = async (req, res, next) => {
  try {
    const token = req.headers["x-api-key"];
    if (!token) {
      return res
        .status(400)
        .send({ status: false, message: "Token must be present." });
    }

    jwt.verify(
      token,
      "thisIsTheSecretKeyForToken(@#$%^&*)",
      (err, decodedToken) => {
        if (err) {
          return res.status(401).send({ status: false, message: err.message });
        }
        req.decodedToken = decodedToken;
        next();
      }
    );
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

/*--------------------------------------------------------------------------------*/
//                            2. Authorisation.
/*--------------------------------------------------------------------------------*/

const authorisation = async (req, res, next) => {
  try {
    //Validation - If Request-Body has <userId>.
    if (req.body.userId) {
      //Validate that <userId> is a Valid Mongoose ObjectId.
      if (!validator.isValidObjectId(req.body.userId)) {
        return res.status(400).send({
          status: false,
          message: "UserID NOT a Valid Mongoose ObjectId.",
        });
      }

      if (req.decodedToken.userId !== req.body.userId) {
        return res.status(403).send({
          status: false,
          message:
            "Unauthorised Access: You CANNOT Create Books By using other User's ID (in Request-Body).",
        });
      }
    }

    //Validation - If Request-Params has <bookId>.
    if (req.params.bookId) {
      //Validate that <bookId> is a Valid Mongoose ObjectId.
      if (!validator.isValidObjectId(req.params.bookId)) {
        return res.status(400).send({
          status: false,
          message: "BookID NOT a Valid Mongoose ObjectId.",
        });
      }

      //Find Books with <filter>.
      const bookFound = await booksModel.findOne({ _id: req.params.bookId });

      //Error: NO Books Found.
      if (!bookFound) {
        return res.status(404).send({
          status: false,
          message: `NO Books Found having <bookId: ${req.params.bookId}>.`,
        });
      }

      //Verify User.
      if (req.decodedToken.userId !== bookFound.userId.toString()) {
        return res.status(403).send({
          status: false,
          message:
            "Unauthorised Access: You CANNOT <Edit: Update OR Delete> Books of other Users.",
        });
      }
    }

    //IF User Authorised then Call <next()>.
    next();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  authentication,
  authorisation,
};
