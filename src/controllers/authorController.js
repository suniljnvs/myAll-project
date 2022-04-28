const authorModel = require("../models/authorModel");

const createAuthor = async function (req, res) {
  try {
    let data = req.body;

    // VALIDATION:
    if (!data.fname) {
      return res
        .status(400)
        .send({status : false,error: "Please Enter fname(required field) " });
    }
    if (!data.lname) {
      return res
        .status(400)
        .send({ status : false, error: " Please Enter lname(required field)" });
    }
    if (!data.title) {
      return res
        .status(400)
        .send({ status : false, msg: " Please Enter title(required field)" });
    }  
      // else if (
      // !data.title !== "Mr" ||
      // !data.title !== "Mrs" ||
      // !data.title !== "Miss"
      //) did not work 
    else if (                                                     
      !data.title === "Mr" ||
      !data.title === "Mrs" ||
      !data.title === "Miss"
    ) {
      return res.status(400).send({ status : false, error: "Please enter valid title" });
    }
    if (!data.email) {
      return res
        .status(400)
        .send({status : false,  msg: " Please Enter email(required field)" });
    } else if (data.email){
      let check = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)
       if (!check){
        return res
        .status(400)
        .send({ status : false , msg: " Please enter valid emailid" });
       }
        if(!(data.email === String(data.email).toLowerCase())){
          return res
          .status(400)
          .send({ status : false , msg: " Capital letters are not allowed in emailid" });
        }
      }
    
    if (!data.password) {
      return res
        .status(400)
        .send({  status : false, msg: " Please enter password(required field)" });
    }
    
    for (const [key, value] of Object.entries(req.body)){
     
      if (onlySpaces(`${value}`) == true) {
       return res.status(400).send({
          status: false,
          error: "Empty Spaces are not accepted in " + `${key}`,
        });
      }
    
    function onlySpaces(str) {
      return /^\s*$/.test(str);
    }
  }
    let savedData = await authorModel.create(data);
    res.status(201).send({ status : true, msg: savedData });
  } 
  catch (err) {
    res.status(500).send({status : false, msg: "Internal Server Error", error: err.message });
  }
};

module.exports.createAuthor = createAuthor;

