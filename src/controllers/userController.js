const jwt = require("jsonwebtoken");
const emailValidator = require("validator");
const userModel = require("../models/userModel");
const validator = require("../utils/validator");

/*--------------------------------------------------------------------------------*/
//                            1. API - CREATE A USER.
/*--------------------------------------------------------------------------------*/

const createUser = async (req, res) => {
  try {
    const requestBody = req.body;

    // Error: If No Data in Request-Body.
    if (Object.keys(requestBody).length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid Request. Please input data in the body.",
      });
    }

    const { title, name, phone, email, password, address } = requestBody;

    //ADDRESS Validation(Correct Format(OBJECT) - if Present ).
    if (typeof address === "string" || address === null || address === false) {
      return res.status(400).json({
        status: false,
        message: "Fill the ADDRESS in correct Format (as an <OBJECT>).",
      });
    }
    if (address) {
      if (Object.keys(address).length === 0) {
        return res.status(400).json({
          status: false,
          message:
            "Invalid ADDRESS. Please enter <STREET> ,<CITY> & <PINCODE> of ADDRESS(<OBJECT>).",
        });
      }
    }

    //TITLE Validation.
    if (!validator.isValidString(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter a Valid TITLE ." });
    }
    if (!validator.isValidTitle(title)) {
      return res.status(400).send({
        status: false,
        message: "TITLE can ONLY be <Mr>, <Mrs> or <Miss>.",
      });
    }

    //NAME Validation.
    if (!validator.isValidString(name)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter Valid NAME." });
    }
    if (!/^[a-zA-Z ]*$/.test(name)) {
      return res.status(400).send({
        status: false,
        message: "NAME can ONLY be Alphabets & White-space(s).",
      });
    }

    //PHONE Validation.
    if (!validator.isValidString(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter a Valid PHONE Number." });
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).send({
        status: false,
        message:
          "PHONE can ONLY be 10-Digit Indian(start with <6,7,8 or 9>) Numbers.",
      });
    }
    const phoneUnique = await userModel.findOne({ phone: phone });
    if (phoneUnique) {
      return res
        .status(400)
        .send({ status: false, message: "PHONE already Registered." });
    }

    //EMAIL Validation.
    if (!validator.isValidString(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter a Valid  EMAIL." });
    }
    if (!emailValidator.isEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid EMAIL Format." });
    }
    const emailUnique = await userModel.findOne({ email: email });
    if (emailUnique) {
      return res
        .status(400)
        .send({ status: false, message: "EMAIL already Registered." });
    }

    //PASSWORD Validation.
    if (!validator.isValidString(password)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter a Valid  PASSWORD." });
    }
    if (!validator.isValidPassword(password)) {
      return res.status(400).send({
        status: false,
        message:
          "Invalid PASSWORD Length: Password must be <8 to 15> characters ONLY.",
      });
    }

    //ADDRESS 'FIELDS' Validation (NOT Mandatory (if Present)).
    if (address) {
      const { street, city, pincode } = address;
      if (!validator.isValidString(street)) {
        return res
          .status(400)
          .send({ status: false, message: "Please enter a Valid STREET." });
      }
      if (!/^[a-zA-Z0-9\/\-\, ]*$/.test(street)) {
        return res.status(400).send({
          status: false,
          message:
            "STREET can be Alphabets, Hyphen(-), Forward-slash(/), Comma(,), Numbers & White-space(s) ONLY.",
        });
      }
      if (!validator.isValidString(city)) {
        return res
          .status(400)
          .send({ status: false, message: "Please enter a Valid CITY." });
      }
      if (!/^[a-zA-Z\- ]*$/.test(city)) {
        return res.status(400).send({
          status: false,
          message: "CITY can be Alphabets, Hyphen(-) & White-space(s) ONLY.",
        });
      }
      if (!validator.isValidString(pincode)) {
        return res
          .status(400)
          .send({ status: false, message: "Please enter a Valid PINCODE." });
      }
      if (!/^[1-9]\d{5}$/.test(pincode)) {
        return res.status(400).send({
          status: false,
          message:
            "PINCODE can ONLY be 6-Digit Indian (cannot start with <0>) Numbers.",
        });
      }
    }

    const user = await userModel.create(requestBody);
    return res.status(201).send({
      status: true,
      message: "User Created Successfully.",
      data: user,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

/*--------------------------------------------------------------------------------*/
//                           2. API - lOGIN USER.
/*--------------------------------------------------------------------------------*/

const userLogin = async (req, res) => {
  try {
    const requestBody = req.body;

    // Error: If No Data in Request-Body.
    if (Object.keys(requestBody).length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid Request. Please input data in the body.",
      });
    }
    const { email, password } = requestBody;

    // Error: If Unnecessary Data(More than 2 'keys') in Request-Body.
    if (Object.keys(requestBody).length > 2) {
      return res.status(400).json({
        status: false,
        message: "Invalid Request: ONLY <email> & <password> are required.",
      });
    }

    //EMAIL Validation.
    if (!validator.isValidString(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter a Valid EMAIL ID." });
    }
    //PASSWORD Validation.
    if (!validator.isValidString(password)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter a Valid PASSWORD." });
    }

    //Find User with matching credentials.
    const userMatch = await userModel.findOne({
      email: email,
      password: password,
    });
    if (!userMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid Credentials.",
      });
    }

    //Generate Token.
    const token = jwt.sign(
      {
        userId: userMatch._id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, //Expire in '12' Hours.
      },
      "thisIsTheSecretKeyForToken(@#$%^&*)"
    );

    //Send Generated token in response.
    return res.status(200).send({
      status: true,
      message: "Token Generated Successfully.",
      data: token,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  createUser,
  userLogin,
};
