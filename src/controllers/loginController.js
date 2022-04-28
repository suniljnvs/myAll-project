const jwt = require("jsonwebtoken");
const authorModel = require("../models/authorModel");


const loginAuthor = async function(req, res) {
    try {
        let authorName = req.body.emailId;
        let password = req.body.password;


        let author = await authorModel.findOne({ emailId: authorName, password: password });
        if (!author)
            return res.status(404).send({ status: false, error: "authorname or the password is not correct" });
        let token = jwt.sign({
                authorId: author._id.toString(),
                books: "Novels",
                writter: "Author",
            },
            "project1-group13"

        );
        res.status(201).send({ status: true, data: token });

    } catch (err) {
        res.status(500).send({ msg: "Internal Server Error", error: err.message });
    }
};

module.exports.loginAuthor = loginAuthor;