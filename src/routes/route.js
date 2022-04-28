const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");
const blogController = require("../controllers/blogController");
const loginController = require("../controllers/loginController");

router.post("/authors", authorController.createAuthor);
router.post("/blogs", blogController.createBlog);

router.get("/blogs", blogController.getBlogs);

router.put("/blogs/:blogId", blogController.updateBlog);

router.delete("/blogs/:blogId", blogController.deleteBlog);
router.delete("/blogs", blogController.deleteBlogsQueryParams);
router.post("/login", loginController.loginAuthor);

module.exports = router;