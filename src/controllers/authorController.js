const authorModel = require("../models/authorModel");
const jwt = require("jsonwebtoken");

const createAuthor = async function (req, res) {
  try {
    let data = req.body;

    // VALIDATION:
    // fname validation
    if (!data.fname) {
      return res
        .status(400)
        .send({ status: false, msg: "Please Enter fname(required field) " });
    }

    // lname validation
    if (!data.lname) {
      return res
        .status(400)
        .send({ status: false, msg: " Please Enter lname(required field)" });
    }

    // title validation
    let enumArr = ["Mr", "Mrs", "Miss"];
    if (!data.title) {
      return res
        .status(400)
        .send({ status: false, msg: " Please Enter title(required field)" });
    } else if (!enumArr.includes(data.title)) {
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid title" });
    }

    // email validation
    if (!data.email) {
      return res
        .status(400)
        .send({ status: false, msg: " Please Enter email(required field)" });
    } else if (data.email) {
      let check = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
        data.email
      );
      if (!check) {
        return res
          .status(400)
          .send({ status: false, msg: " Please enter valid emailid" });
      }
      if (!(data.email === String(data.email).toLowerCase())) {
        return res.status(400).send({
          status: false,
          msg: "Capital letters are not allowed in emailid",
        });
      }
    }
    // email duplication check
    let emaildb = await authorModel.findOne(
      { email: data.email },
      { email: 1, _id: 0 }
    );
    if (emaildb) {
      return res.status(400).send({
        status: false,
        msg: "We are sorry; this email is already registered",
      });
    }

    // password validation
    if (!data.password) {
      return res
        .status(400)
        .send({ status: false, msg: " Please enter password(required field)" });
    }

    for (const [key, value] of Object.entries(req.body)) {
      if (onlySpaces(`${value}`) == true) {
        return res.status(400).send({
          status: false,
          msg: "Empty Spaces are not accepted in " + `${key}`,
        });
      }
      function onlySpaces(str) {
        return /^\s*$/.test(str);
      }
    }

    let savedData = await authorModel.create(data);
    res.status(201).send({ status: true, msg: savedData });
  } catch (err) {
    res.status(500).send({
      status: false,
      msg: "Internal Server Error",
      error: err.message,
    });
  }
};

const loginAuthor = async function (req, res) {
  try {
    let email = req.body.email;
    let password = req.body.password;

    let loginCredentials = await authorModel.findOne({
      email: email,
      password: password,
    });
    if (!loginCredentials)
      return res.status(400).send({
        status: false,
        error: "email or password is incorrect",
      });
    let token = jwt.sign(
      {
        email: loginCredentials.email.toString(),
        books: "Novels",
        writer: "Author",
      },
      "project1-group13"
    );
    res.setHeader("x-api-key",token)
    res.status(201).send({ status: true, msg:"Login Successfull! Token sent in header (x-api-key) " });
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
};

module.exports = { createAuthor, loginAuthor };
