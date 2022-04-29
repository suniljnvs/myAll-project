const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");
const blogController = require("../controllers/blogController");
const middleware = require("../middlewares/auth");

router.post("/authors", authorController.createAuthor);
router.post("/login", authorController.loginAuthor);
router.post("/blogs", middleware.authentication, blogController.createBlog);
router.get("/blogs", middleware.authentication, blogController.getBlogs);

router.put(
  "/blogs/:blogId",
  middleware.authentication,
  middleware.authorisation,
  blogController.updateBlog
);

router.delete(
  "/blogs/:blogId",
  middleware.authentication,
  middleware.authorisation,
  blogController.deleteBlog
);
router.delete(
  "/blogs",
  middleware.authentication,
  middleware.authorisation,
  blogController.deleteBlogsQueryParams
);

module.exports = router;
