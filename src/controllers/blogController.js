const blogModel = require("../models/blogModel");
const authorModel = require("../models/authorModel");
const mongoose = require("mongoose");

//------------------------------------------------------------------------------------------------------------------------------------------------------

const createBlog = async function (req, res) {
  try {
    let data = req.body;
    if (Object.keys(data).length != 0) {
      let authorId = req.body.authorId;
      if (!authorId) return res.send({ msg: "authorId is required" });
      let validationAuthorId = await authorModel.findById(authorId);
      if (!validationAuthorId) return res.send({ msg: "enter valid authorId" });

      if (!data.title)
        return res.status(400).send({
          status: false,
          msg: " Please enter title for the blog (Required Field)",
        });
      if (!data.body)
        return res.status(400).send({
          status: false,
          msg: " Please enter body for the blog (Required Field)",
        });
      if (!data.category)
        return res.status(400).send({
          status: false,
          msg: " Please enter category for the blog (Required Field)",
        });

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
      let blog = req.body;
      let blogCreated = await blogModel.create(blog);
      res.status(201).send({ status: true, data: blogCreated });
    } else {
      return res.status(400).send({ status: false, msg: "Bad request" });
    }
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

const getBlogs = async function (req, res) {
  try {
    // Data sent through query params
    let authorid = req.query.authorId;
    let category = req.query.category;
    let tags = req.query.tags;
    let subcategory = req.query.subcategory;

    // DATA VALIDATIONS:
    // CASE-1: Every query param's value is empty, i.e., ""(empty string)
    if (!authorid && !category && !tags && !subcategory) {
      return res.status(400).send({
        status: false,
        msg: "Please enter any one query param to proceed!",
      });
    }
    // CASE-2: authorid path variable's value is not an ObjectId; EXCEPTION: mongoose.isValidObjectId is true for 12 character long string
    if (!authorid === "") {
      if (!mongoose.isValidObjectId(authorid) && authorid.length !== 12) {
        return res
          .status(400)
          .send({ status: false, msg: "authorid is invalid!" });
      }
      // SPECIAL CONSIDERATION: authorid path variable's value is a 12 character long string
      // (Taken into account because mongoose.isValidObjectId is true for 12 character long string)
      else if (authorid.length === 12) {
        return res
          .status(400)
          .send({ status: false, msg: "authorid is invalid!" });
      }
    }

    //Array containing query params as objects
    let conditionArr = [
      { authorId: authorid },
      { category: category },
      { tags: tags },
      { subcategory: subcategory },
    ];

    //ConditionArr is manipulated in such a way that if values(against respective keys in query params) are not entered then that object is eliminated all together from ConditionArr
    for (let i = 0; i < conditionArr.length; i++) {
      // "x" is an element(OBJECT type) inside conditionArr (index according to iteration)
      let x = conditionArr[i];

      // Object.values() is used to access the value of "x" OBJECT; since we don't know the key(changes according to iteration)

      // valueArr is an ARRAY containing a single element(value of "x" OBJECT)
      valueArr = Object.values(x);
      // Hence, we will use valueArr[0] to access it
      if (!valueArr[0]) {
        conditionArr.splice(i, 1);
        i--;
      }
    }

    //IMPORTANT CONCEPT: We should not be able to list deleted(isDeleted: true) blogs using "getBlogs"
    // Hence, {isDeleted: false} is included in conditionArr
    conditionArr.push({ isDeleted: false });

    let Blogs = await blogModel.find({
      $and: conditionArr,
    });

    // If there exists no blog satisfying the conditions
    // Then, Boolean(Blogs.length) === false
    // Thus, Boolean(!Blogs.length) === true
    if (Blogs.length === 0) {
      return res
        .status(404)
        .send({ status: false, msg: "We are sorry; Blog(s) does not exist" });
    }

    // If there exists blog(s) satisfying the conditions
    if (Blogs.length !== 0) {
      let requiredBlogs = await blogModel.find({ $and: conditionArr });

      res.send({ status: true, msg: requiredBlogs });
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//----------------------------------------------------------------------------------------------------------------------------------------------------

const updateBlog = async function (req, res) {
  try {
    var today = new Date();
    let blogId = req.params.blogId;

    // CASE-1: blogId path variable is empty
    if (blogId === ":blogId") {
      return res
        .status(400)
        .send({ status: false, msg: "Please enter blogId to proceed!" });
    }
    // CASE-2: blogId path variable's value is not an ObjectId; EXCEPTION: mongoose.isValidObjectId is true for 12 character long string
    else if (!mongoose.isValidObjectId(blogId) && blogId.length !== 12) {
      return res.status(400).send({ status: false, msg: "blogId is invalid!" });
    }
    // SPECIAL CONSIDERATION: blogId path variable's value is a 12 character long string
    // (Taken into account because mongoose.isValidObjectId is true for 12 character long string)
    else if (blogId.length === 12) {
      return res.status(400).send({ status: false, msg: "blogId is invalid!" });
    }

    let blogs = await blogModel.findOne({ _id: blogId });
    console.log(blogs);
    if (!blogs)
      return res
        .status(404)
        .send({ status: false, msg: "blogId does not exist - Invalid" });

    //Creating an object named fieldToUpdate with all the possible key-value pair which can be passed from body
    let fieldToUpdate = {
      title: req.body.title,
      subcategory: req.body.subcategory,
      body: req.body.body,
      tags: req.body.tags,
      isPublished: req.body.isPublished,
      category: req.body.category,
      isPublished: req.body.isPublished,
    };
    //The keys which are not present in req.body have their value as null and in case of boolean type field it would be false, so those keys are deleted by running the for-loop for all the key-value pairs of our object "fieldToUpdate"
    //Object.entries(fieldToUpdate) would return an array of key-value pairs of the object fieldToUpdate
    for (const [key, value] of Object.entries(fieldToUpdate)) {
      if (!value) delete fieldToUpdate[key];
      if (onlySpaces(`${value}`) == true) {
        return res.status(400).send({
          status: false,
          errro: "Empty Spaces are not accepted in " + `${key}`,
        });
      }
    }
    function onlySpaces(str) {
      return /^\s*$/.test(str);
    }
    //now we have only those key-value pair combinations which are passed by the client
    //Because our body and subcategory are an array of string , so we have to push the req.body data into the pre-existing data and similiarly in case of body which is string by type we are concatenating the new data to the pre existing string.
    let blog = await blogModel.findById(blogId);
    let updatedBody = blog.body;
    updatedBody += req.body.body;
    let updatedTags = blog.tags;
    updatedTags.push(req.body.tags);
    let updatedSubcategory = blog.subcategory;
    updatedSubcategory.push(req.body.subcategory);

    //Because tags , subcategory and body data needs to be added in pre-existing data, so they are updated in this manner
    if ("tags" in fieldToUpdate) {
      fieldToUpdate.tags = updatedTags;
    }
    if ("subcategory" in fieldToUpdate) {
      fieldToUpdate.subcategory = updatedSubcategory;
    }
    if ("body" in fieldToUpdate) {
      fieldToUpdate.body = updatedBody;
    }
    //If there is a key named isPublished in req.body so we will add a new key named publishedAt in our document to get the date and time it is published
    if ("isPublished" in fieldToUpdate) {
      fieldToUpdate.publishedAt = today;
    }

    if (!blog.isDeleted == true) {
      let updatedData = await blogModel.findByIdAndUpdate(
        blogId,
        { $set: { ...fieldToUpdate } },
        { new: true, upsert: true }
      );
      return res.status(200).send({ status: true, data: updatedData });
    }
    //If the blog is already been deleted , it would display the msg message
    else
      res.status(404).send({
        status: false,
        msg: " Blog with this id does not exist", //due to privacy concerns, we are not telling client that document has been deleted
      });
  } catch (err) {
    // console.log(err);
    res.status(500).send({
      status: false,
      msg: "Internal Server Error",
      error: err.message,
    });
  }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

const deleteBlog = async function (req, res) {
  try {
    // "data" stores the blogId sent through path variable
    let data = req.params.blogId;

    // DATA VALIDATION:
    // CASE-1: blogId path variable is empty
    if (data === ":blogId") {
      return res
        .status(400)
        .send({ status: false, msg: "Please enter blogId to proceed!" });
    }
    // CASE-2: blogId path variable's value is not an ObjectId; EXCEPTION: mongoose.isValidObjectId is true for 12 character long string
    else if (!mongoose.isValidObjectId(data) && data.length !== 12) {
      return res.status(400).send({ status: false, msg: "blogId is invalid!" });
    }
    // SPECIAL CONSIDERATION: blogId path variable's value is a 12 character long string
    // (Taken into account because mongoose.isValidObjectId is true for 12 character long string)
    else if (data.length === 12) {
      return res.status(400).send({ status: false, msg: "blogId is invalid!" });
    }

    // "check" OBJECT will contain a key "isDeleted" and its value; of the blog document corresponding to the blogId
    let check = await blogModel.findOne(
      { _id: data },
      {
        isDeleted: 1,
        _id: 0,
      }
    );

    // if check is null; we can't use Object.keys(check) to validate
    // hence, we use !check to validate

    // Object.keys(check) won't work if check === null;
    // If check is not null, then:
    // Object.keys(check).length will give the length of the array created using Object.keys against "check" object

    //CONDITIONS
    //CASE-1: blogId does not exist
    if (!check) {
      return res.status(404).send({
        status: false,
        msg: "We are sorry; Given blogId does not exist",
      });
    }

    //CASE-2: blogId exists but is deleted
    else if (check && check.isDeleted) {
      return res.status(404).send({
        status: false,
        msg: "We are sorry; Given blogId does not exist",
      });
    }

    //CASE-3: blogId exists but is not deleted
    else if (check && !check.isDeleted) {
      let savedData = await blogModel.findOneAndUpdate(
        {
          _id: data,
        },
        {
          isDeleted: true,
        }
        // ,{ new: true } //We can skip this since, anyways we are not sending the databack using response
      );
      // return res.status(200).send({ status: false, msg: savedData }); //Commented: CAN BE USED FOR TESTING

      //Instructions: HTTP status 200 without any response body
      return res.status(200).send();
    }
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
};

// -----------------------------------------------------------------------------------------------------------------------------------------------------

const deleteBlogsQueryParams = async function (req, res) {
  try {
    // Data sent through query params
    let category = req.query.category;
    let authorid = req.query.authorid;
    let tagName = req.query["tag name"];
    let subcategoryName = req.query["subcategory name"];
    let isPublished = req.query.isPublished;

    // DATA VALIDATIONS:
    // CASE-1: Every query param's value is empty, i.e., ""(empty string)
    if (
      !category &&
      !authorid &&
      !tagName &&
      !subcategoryName &&
      !isPublished
    ) {
      return res.status(400).send({
        status: false,
        msg: "Please enter any one query param to proceed!",
      });
    }

    //📌 mongoose.Types.ObjectId.isValid(authorid)

    // CASE-2: authorid path variable's value is not an ObjectId; EXCEPTION: mongoose.isValidObjectId is true for 12 character long string
    if (!authorid === "") {
      if (!mongoose.isValidObjectId(authorid) && authorid.length !== 12) {
        //First check whether  {
        return res
          .status(400)
          .send({ status: false, msg: "authorid is invalid!" });
      }
      // SPECIAL CONSIDERATION: authorid path variable's value is a 12 character long string
      // (Taken into account because mongoose.isValidObjectId is true for 12 character long string)
      else if (authorid.length === 12) {
        return res
          .status(400)
          .send({ status: false, msg: "authorid is invalid!" });
      }
    }
    // CASE-3: isPublished's allowed values are "true", "false" and ""(empty string); Hence, empty string should not pass the below "if" statement
    if (
      isPublished !== "true" &&
      isPublished !== "false" &&
      isPublished !== "" &&
      isPublished !== undefined
    ) {
      return res.status(400).send({
        status: false,
        msg: "isPublished has invalid value!",
      });
    }

    //Array containing query params as objects
    let conditionArr = [
      { category: category },
      { authorid: authorid },
      { tagName: tagName },
      { subcategory: subcategoryName },
      { isPublished: isPublished },
    ];

    //ConditionArr is manipulated in such a way that if values(against respective keys in query params) are not entered then that object is eliminated all together from ConditionArr
    for (let i = 0; i < conditionArr.length; i++) {
      // "x" is an element(OBJECT type) inside conditionArr (index according to iteration)
      let x = conditionArr[i];

      // Object.values() is used to access the value of "x" OBJECT; since we don't know the key(changes according to iteration)

      // valueArr is an ARRAY containing a single element(value of "x" OBJECT)
      valueArr = Object.values(x);
      // Hence, we will use valueArr[0] to access it
      if (!valueArr[0]) {
        conditionArr.splice(i, 1);
        i--;
      }
    }

    let Blogs = await blogModel.find({
      $and: conditionArr,
    });

    // If there exists no blog satisfying the conditions
    // Then, Boolean(Blogs.length) === false
    // Thus, Boolean(!Blogs.length) === false ( here, Blogs.length !== 0; still )
    // Therefore, we will equate it with 0 and check
    if (Blogs.length === 0) {
      return res
        .status(404)
        .send({ status: false, msg: "We are sorry; Blog does not exist" });
    }

    // If there exists blog(s) satisfying the conditions
    if (Blogs.length !== 0) {
      let deleteBlogs = await blogModel
        .find({ $and: conditionArr }) // put ispublished equal to true
        .updateMany({}, { isDeleted: true });
      return res.status(200).send({ status: true, msg: deleteBlogs });
    }
  } catch (err) {
    res.status(500).send({ msg: "Internal Server Error", error: err.message });
  }
};

//------------------------------------------------------------------------------------------------------------------------------------------------------

module.exports = {
  createBlog,
  getBlogs,
  updateBlog,
  deleteBlog,
  deleteBlogsQueryParams,
};
