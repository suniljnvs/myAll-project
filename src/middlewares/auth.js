const jwt = require("jsonwebtoken");
const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogModel");
const mongoose = require("mongoose");

const authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-Api-key"];
    if (!token) token = req.headers["x-api-key"];
    if (!token)
      return res.status(400).send({
        status: false,
        msg: "Token required! Please login to generate token",
      });

    let decodedToken = jwt.verify(token, "project1-group13");
    if (!decodedToken)
      return res.status(401).send({ status: false, msg: "token is invalid" });
    next();
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
};

const authorisation = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    let decodedToken = jwt.verify(token, "project1-group13");

    let blogId = req.params.blogId;

    // CASE-1(blogId VALIDATION): blogId path variable is empty
    if (blogId === ":blogId") {
      return res
        .status(400)
        .send({ status: false, msg: "Please enter blogId to proceed!" });
    }
    // CASE-2(blogId VALIDATION): blogId path variable's value is not an ObjectId
    else if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).send({ status: false, msg: "blogId is invalid!" });
    }
    // CASE-3(blogId VALIDATION): blogId is not present in the database
    let blog = await blogModel
      .findOne({ _id: blogId })
      .select({ authorId: 1, _id: 0 });
    // if blog is null => we can't use Object.keys(check) to validate, hence, we use !check to validate
    if (!blog) {
      return res.status(400).send({
        status: false,
        msg: "We are sorry; Given blogId does not exist!",
      });
    }

    //📌 Authorisation using blogId:
    // "email" is of the form {email: "xyz@abc.com"}
    let email = await authorModel
      .findOne({ _id: blog.authorId })
      .select({ email: 1, _id: 0 });
    if (decodedToken.email !== email.email) {
      return res
        .status(401)
        .send({ status: false, msg: "Authorisation Failed!" });
    } else if (decodedToken.email === email.email) {
      next();
    }
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
};

module.exports = { authentication, authorisation };
