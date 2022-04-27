const blogModel = require("../models/blogModel");

const createBlog = async function (req, res) {
  let data = req.body;
  let blog = await blogModel.create(data);
  res.send({ data: blog });
};
const updateBlog = async function (req, res) {
  try {
    var today = new Date();
    let blogId = req.params.blogId;

    let fieldToUpdate = {
      title: req.body.title,
      subcategory: req.body.subcategory,
      body: req.body.body,
      tags: req.body.tags,
      isPublished: req.body.isPublished,
      category: req.body.category,
      isPublished: req.body.isPublished,
    };

    for (const [key, value] of Object.entries(fieldToUpdate)) {
      if (!value) {
        delete fieldToUpdate[key];
      }
    }

    let blog = await blogModel.findById(blogId);
    let updatedBody = blog.body;
    updatedBody += req.body.body;
    let updatedTags = blog.tags;
    updatedTags.push(req.body.tags);
    let updatedSubcategory = blog.subcategory;
    updatedSubcategory.push(req.body.subcategory);

    if ("tags" in fieldToUpdate) {
      fieldToUpdate.tags = updatedTags;
    }
    if("subcategory" in fieldToUpdate){
        fieldToUpdate.subcategory = updatedSubcategory
    }
    if ("body" in fieldToUpdate) {
      fieldToUpdate.body = updatedBody;
    }
    if ("isPublished" in fieldToUpdate) {
      fieldToUpdate.publishedAt = today;
    }
    if(!blog.isDeleted == true ){
    let updatedData = await blogModel.findByIdAndUpdate(
      blogId ,
      { $set: { ...fieldToUpdate } },
      { new: true, upsert: true }
    );
    return res.status(200).send({ status: true, data: updatedData });
    }
    else 
    res.status(500).send({status : false , error : " Object with this id has been deleted"})
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({
        status: false,
        msg: "Internal Server Error",
        error: err.message,
      });
  }
};
module.exports = { createBlog, updateBlog };
