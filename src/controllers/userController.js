const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const validator = require("../utils/validator");
const emailValidator = require("validator");

/*---------------------------------------------------------------------------------------------------------- 1. API - CREATE A USER. -------------------------------------------------------------------------------------*/
const createUser = async (req, res) => {
  try {
    const requestBody = req.body;
    
    // Error: No Data in Request-Body.
    if (Object.keys(requestBody).length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid Request. Please input data in the body.",
      });
    }

    const { title, name, phone, email, password ,address } = requestBody ;

     //ADDRESS Validation.
     if (typeof address !== 'object') {
      return res.status(400).json({
        status: false,
        message: "Fill the ADDRESS in correct Format.",
      });
     }

    if (Object.keys(address).length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid ADDRESS. Please fill ADDRESS in the body.",
      });
    }

    const { street, city, pincode } = address;

    //TITLE Validation.
    if(!validator.isValidString(title)) {
      // console.log("Title correct");
      return res.status(400).send({ status: false, message: "Invalid TITLE ." });
    }
    if(!validator.isValidTitle(title)) {
      return res.status(400).send({ status: false, message: "TITLE can ONLY be <Mr>, <Mrs> or <Miss>." })
    }

    //NAME Validation.
    if(!validator.isValidString(name)) {
      // console.log("Title correct");
      return res.status(400).send({ status: false, message: "Invalid NAME." });
    }
    if(!/^[a-zA-Z ]*$/.test(name)) {
      return res.status(400).send({ status: false, message: "NAME can ONLY be Alphabets & White-space(s)." });
    }

     //PHONE Validation.
     if(!validator.isValidString(phone)) {
      return res.status(400).send({ status: false, message: "Invalid PHONE." });
    }
    if(!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).send({ status: false, message: "PHONE can ONLY be 10-Digit Indian(start with <6,7,8 or 9>) Numbers." });
    }
    const phoneUnique = await userModel.findOne({phone: phone});
    if (phoneUnique) {
      return res.status(400).send({ status: false, message: "PHONE already Registered." });
    }

     //EMAIL Validation.
     if(!validator.isValidString(email)) {
      return res.status(400).send({ status: false, message: "Invalid EMAIL." });
    }
    if(!emailValidator.isEmail(email)) {
      return res.status(400).send({ status: false, message: "Invalid EMAIL Format." });
    }
    const emailUnique = await userModel.findOne({email: email});
    if (emailUnique) {
      return res.status(400).send({ status: false, message: "EMAIL already Registered." });
    }

    //PASSWORD Validation.
    if(!validator.isValidString(password)) {
      return res.status(400).send({ status: false, message: "Invalid PASSWORD." });
    }
    if(!validator.isValidPassword(password)) {
      return res.status(400).send({ status: false, message: "Invalid PASSWORD Length (between 8 & 15 characters ONLY)." });
    }

     //ADDRESS Validation.
    if(!validator.isValidString(street)) {
      return res.status(400).send({ status: false, message: "Invalid STREET." });
    }
    if(!/^[a-zA-Z0-9\/\- ]*$/.test(street)) {
      return res.status(400).send({ status: false, message: "STREET can be Alphabets, Hyphen(-), Forward-slash(/), Numbers & White-space(s) ONLY." });
    }
    if(!validator.isValidString(city)) {
      return res.status(400).send({ status: false, message: "Invalid CITY." });
    }
    if(!/^[a-zA-Z\- ]*$/.test(city)) {
      return res.status(400).send({ status: false, message: "CITY can be Alphabets, Hyphen(-) & White-space(s) ONLY." });
    }
    if(!validator.isValidString(pincode)) {
      return res.status(400).send({ status: false, message: "Invalid PINCODE." });
    }
    if(!/^[1-9]\d{5}$/.test(pincode)) {
      return res.status(400).send({ status: false, message: "PINCODE can ONLY be 6-Digit Indian (cannot start with <0>) Numbers." });
    }

    const user = await userModel.create(requestBody);
    return res
      .status(201)
      .send({ status: true, message: "User Created Successfully.", data: user });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

/*-------------------------------------------------------------------------------------------------------------- 2. API - lOGIN USER. -------------------------------------------------------------------------------------*/

const userLogin = async (req, res) => {
  try {
    const requestBody = req.body;
    
    // Error: No Data in Request-Body.
    if (Object.keys(requestBody).length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid Request. Please input data in the body.",
      });
    }
    const { email, password } = requestBody ;

     //EMAIL Validation.
     if(!validator.isValidString(email)) {
      return res.status(400).send({ status: false, message: "EMAIL NOT a Valid String." });
    }
    //PASSWORD Validation.
    if(!validator.isValidString(password)) {
      return res.status(400).send({ status: false, message: "PASSWORD NOT a Valid String." });
    }

    const userMatch = await userModel.findOne({ email: email, password: password });
    if(!userMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid Credentials.",
      });
    }

    const token = jwt.sign({
      email: userMatch.email,
      iat: Math.floor( Date.now() / 1000 ),
      exp: Math.floor( Date.now() / 1000 ) + 10*60,   //Expire in 10 minutes.
    }, "thisIsTheSecretKeyForToken(@#$%^&*)" );

    return res
      .status(200)
      .send({ status: true, message: "Token Generated Successfully.", data: token });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  createUser,
  userLogin,
};
