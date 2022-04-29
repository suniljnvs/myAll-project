
const jwt = require("jsonwebtoken");

const authentication = function (req, res, next) {
  let token = req.headers["x-Api-key"];
  if (!token) token = req.headers["x-api-key"];
  if (!token) return res.send({ status: false, msg: "token must be present" });
  console.log(token);
  let decodedToken = jwt.verify(token, "project1-group13");
  if (!decodedToken)
    return res.send({ status: false, msg: "token is invalid" });
  next();
};

module.exports.authentication = authentication;


