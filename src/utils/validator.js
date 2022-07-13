const mongoose = require("mongoose");

const isValidString = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidTitle = function (value) {
  return ["Mr", "Mrs", "Miss"].indexOf(value) !== -1;
};

const isValidObjectId = function (value) {
  return mongoose.Types.ObjectId.isValid(value);
};

const isValidPassword = function (value) {
  return value.length >= 8 && value.length <= 15;
};

const isValidRequestBody = function (value) {
  return Object.keys(value).length > 0;
};

const isValidISBN = function (value) {
  return /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(value);
};

const isValidRating = function (value) {
  return /^[1-5]$/.test(value);
};

const isValidReview = function (value) {
  if (typeof value !== "string" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidDate = function (value) {
  return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(value);
};

module.exports = {
  isValidString,
  isValidISBN,
  isValidObjectId,
  isValidPassword,
  isValidTitle,
  isValidRequestBody,
  isValidRating,
  isValidReview,
  isValidDate,
};
