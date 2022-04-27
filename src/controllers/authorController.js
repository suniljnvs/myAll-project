const authorModel = require("../models/authorModel");

const createAuthor = async function (req, res) {
  try {
    let data = req.body;

    // VALIDATION:
    if (!data.fname) {
      return res
        .status(400)
        .send({ error: "Please Enter fname(required field) " });
    }
    if (!data.lname) {
      return res
        .status(400)
        .send({ error: " Please Enter lname(required field)" });
    }
    if (!data.title) {
      return res
        .status(400)
        .send({ msg: " Please Enter title(required field)" });
    } else if (
      data.title !== "Mr" ||
      data.title !== "Mrs" ||
      data.title !== "Miss"
    ) {
      return res.status(400).send({ error: "Please enter valid title" });
    }
    if (!data.email) {
      return res
        .status(400)
        .send({ msg: " Please Enter email(required field)" });
    }
    if (!data.password) {
      return res
        .status(400)
        .send({ msg: " Please enter password(required field)" });
    }

    let savedData = await authorModel.create(data);
    res.status(201).send({ msg: savedData });
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
};

module.exports.createAuthor = createAuthor;
