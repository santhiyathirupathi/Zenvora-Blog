const express = require("express");
const router = express.Router();

const {
    createBlog,
    getBlogs,
    getPopularBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    getAdminStats
} = require("../controllers/blogController");

router.get("/popular", getPopularBlogs);
router.get("/stats", getAdminStats);
router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

module.exports = router;
