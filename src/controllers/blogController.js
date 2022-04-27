const blogModel = require("../models/blogModel");


const updateBlog = async function (req, res) {
  try {
    var today = new Date();
    let blogId = req.params.blogId;
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
      if (!value) {
        delete fieldToUpdate[key];
      }
    }
    //now we have only those key-value pair combinations which are passed by the client
    //Because our body and subcategory are an array of string , so we have to push the req.body data into the pre-existing data and similiarly in case of body which is string by type we are concatenating the new data to the pre existing string.
    let blog = await blogModel.findById(blogId);
    //Saving pre-existing body data in updatedBody variable
    let updatedBody = blog.body;
    //Concatenating req.body.body data to pre-existing data
    updatedBody += req.body.body;
    //Saving pre-existing tags data in updatedTags variable
    let updatedTags = blog.tags;
    //Pushing req.body.tags data to pre-existing data
    updatedTags.push(req.body.tags);
    //Saving pre-existing subcategory data in updatedSubcategory variable
    let updatedSubcategory = blog.subcategory;
    //Pushing req.body.subcategory data to pre-existing data
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
    //If the blog is already been deleted , it would display the error message
    else
      res
        .status(404)
        .send({
          status: false,
          error: " Object with this id has been deleted",
        });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: false,
      msg: "Internal Server Error",
      error: err.message,
    });
  }
};


module.exports = { createBlog, updateBlog };
