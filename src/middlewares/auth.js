const { decode } = require("jsonwebtoken"); // what is decode used for?
const jwt = require("jsonwebtoken");
const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogModel");
const mongoose = require("mongoose");

const authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-Api-key"];
    if (!token) token = req.headers["x-api-key"];
    if (!token)
      return res.send({ status: false, msg: "token must be present" });

    let decodedToken = jwt.verify(token, "project1-group13");
    if (!decodedToken)
      return res.send({ status: false, msg: "token is invalid" });
    next();
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
};

const authorisation = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    let decodedToken = jwt.verify(token, "project1-group13");

    // function declared to reduce repetitive code
    let authoris = function (email) {
      if (decodedToken.email !== email.email) {
        return res
          .status(401)
          .send({ status: false, msg: "Authorisation Failed!" });
      } else if (decodedToken.email === email.email) {
        next();
      }
    };

    let blogId = req.params.blogId;

    if (blogId) {
      // CASE-1(blogId VALIDATION): blogId path variable is empty
      if (blogId === ":blogId") {
        return res
          .status(400)
          .send({ status: false, msg: "Please enter blogId to proceed!" });
      }
      // CASE-2(blogId VALIDATION): blogId path variable's value is not an ObjectId
      else if (!mongoose.Types.ObjectId.isValid(blogId)) {
        return res
          .status(400)
          .send({ status: false, msg: "blogId is invalid!" });
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
      authoris(email);
    }

    let authorId = req.query.authorid;

    if (authorId) {
      // CASE-1(authorId VALIDATION): authorId's value is not an ObjectId
      let authorId = req.query.authorid;
      if (authorId !== "") {
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
          return res
            .status(400)
            .send({ status: false, msg: "authorId is invalid!" });
        }
      }
      //CASE-2(authorId VALIDATION): authorId is not present in the database
      let author = await authorModel.findOne({ _id: authorId });
      if (!author) {
        return res.status(400).send({
          status: false,
          msg: "We are sorry; authorId does not exist",
        });
      }

      //📌 Authorisation using authorId (for APIs which do not have blogId):
      let email = await authorModel
        .findOne({ _id: authorId })
        .select({ email: 1, _id: 0 });
      authoris(email);
    }

    //CASE-3(authorId VALIDATION): authorId key's value in query param is empty
    else if (!authorId&&!blogId) {
      return res.status(400).send({
        status: false,
        msg: "Please enter authorId to proceed",
      });
    }
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
};

module.exports = { authentication, authorisation };
