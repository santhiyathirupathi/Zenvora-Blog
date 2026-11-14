const Blog = require("../models/Blog");
const Category = require("../models/Category");


const calcReadingTime = (text) => {
    if (!text) return 1;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
};


const processScheduledBlogs = async () => {
    try {
        const now = new Date();
        await Blog.updateMany(
            {
                status: "scheduled",
                scheduledPublishDate: { $lte: now }
            },
            {
                $set: { status: "published" }
            }
        );
    } catch (err) {
        console.error("Scheduled check error:", err.message);
    }
};


const createBlog = async (req, res) => {
    try {
        const {
            title,
            description,
            content,
            category,
            slug: customSlug,
            status = "draft",
            scheduledPublishDate,
            featured = false,
            tags = [],
            author,
            authorRole,
            authorAvatar,
            image,
            seoTitle,
            seoDescription
        } = req.body;

        if (!title || !description || !content || !category) {
            return res.status(400).json({
                message: "Please fill all required fields: title, description, content, and category"
            });
        }

        
        let baseSlug = (customSlug || title)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        if (!baseSlug) baseSlug = `post-${Date.now()}`;

       
        let slug = baseSlug;
        let counter = 1;
        while (await Blog.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const readingTime = calcReadingTime(content);

        const blog = await Blog.create({
            title: title.trim(),
            slug,
            description: description.trim(),
            content,
            category: category.trim(),
            image: image || "",
            tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
            author: author || "Tech Editorial Team",
            authorRole: authorRole || "Technology Specialist",
            authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author || "Tech")}`,
            status,
            scheduledPublishDate: status === "scheduled" && scheduledPublishDate ? new Date(scheduledPublishDate) : null,
            featured: Boolean(featured),
            readingTime,
            seoTitle: seoTitle || title,
            seoDescription: seoDescription || description
        });

        res.status(201).json({
            message: "Blog created successfully",
            blog
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getBlogs = async (req, res) => {
    try {
        await processScheduledBlogs();

        const {
            search,
            category,
            tag,
            status,
            featured,
            popular,
            sort = "newest",
            page = 1,
            limit = 6
        } = req.query;

        const filter = {};

     
        if (status && status !== "all") {
            filter.status = status;
        } else if (!status) {
            filter.status = "published";
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                { tags: { $in: [new RegExp(search, "i")] } }
            ];
        }

        if (category && category !== "All") {
            filter.category = category;
        }

        if (tag) {
            filter.tags = tag;
        }

        if (featured === "true") {
            filter.featured = true;
        }

       
        let sortOption = { createdAt: -1 };
        if (sort === "oldest") {
            sortOption = { createdAt: 1 };
        } else if (sort === "popular" || popular === "true") {
            sortOption = { views: -1, createdAt: -1 };
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 6);

        const blogs = await Blog.find(filter)
            .sort(sortOption)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const total = await Blog.countDocuments(filter);

        res.json({
            blogs,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getPopularBlogs = async (req, res) => {
    try {
        await processScheduledBlogs();
        const limit = parseInt(req.query.limit, 10) || 5;
        const blogs = await Blog.find({ status: "published" })
            .sort({ views: -1, createdAt: -1 })
            .limit(limit);

        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getBlogById = async (req, res) => {
    try {
        await processScheduledBlogs();
        const identifier = req.params.id;

        let blog;
        
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            blog = await Blog.findById(identifier);
        }

        if (!blog) {
            blog = await Blog.findOne({ slug: identifier });
        }

        if (!blog) {
            return res.status(404).json({ message: "Article not found" });
        }
 
        blog.views = (blog.views || 0) + 1;
        await blog.save();

       
        const related = await Blog.find({
            status: "published",
            category: blog.category,
            _id: { $ne: blog._id }
        })
            .sort({ createdAt: -1 })
            .limit(3);

       
        const previousBlog = await Blog.findOne({
            status: "published",
            createdAt: { $lt: blog.createdAt }
        })
            .sort({ createdAt: -1 })
            .select("title slug image category createdAt");

        const nextBlog = await Blog.findOne({
            status: "published",
            createdAt: { $gt: blog.createdAt }
        })
            .sort({ createdAt: 1 })
            .select("title slug image category createdAt");

        res.json({
            blog,
            related,
            previousBlog,
            nextBlog
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateBlog = async (req, res) => {
    try {
        const {
            title,
            slug: customSlug,
            content,
            status,
            scheduledPublishDate
        } = req.body;

        const existing = await Blog.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Blog not found" });
        }

        let slug = existing.slug;
        if (customSlug && customSlug !== existing.slug) {
            const cleanSlug = customSlug
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            const duplicate = await Blog.findOne({
                slug: cleanSlug,
                _id: { $ne: existing._id }
            });

            if (!duplicate) {
                slug = cleanSlug;
            }
        }

        const updateData = { ...req.body, slug };

        if (content) {
            updateData.readingTime = calcReadingTime(content);
        }

        if (status === "scheduled" && scheduledPublishDate) {
            updateData.scheduledPublishDate = new Date(scheduledPublishDate);
        } else if (status === "published") {
            updateData.scheduledPublishDate = null;
        }

        if (req.body.tags && typeof req.body.tags === "string") {
            updateData.tags = req.body.tags.split(",").map(t => t.trim()).filter(Boolean);
        }

        const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.json({
            message: "Blog updated successfully",
            blog
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json({
            message: "Blog deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getAdminStats = async (req, res) => {
    try {
        const total = await Blog.countDocuments();
        const published = await Blog.countDocuments({ status: "published" });
        const draft = await Blog.countDocuments({ status: "draft" });
        const scheduled = await Blog.countDocuments({ status: "scheduled" });

        const viewAgg = await Blog.aggregate([
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]);
        const totalViews = viewAgg.length > 0 ? viewAgg[0].totalViews : 0;

        const categoriesCount = await Category.countDocuments();

        res.json({
            total,
            published,
            draft,
            scheduled,
            totalViews,
            categoriesCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBlog,
    getBlogs,
    getPopularBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    getAdminStats
};
