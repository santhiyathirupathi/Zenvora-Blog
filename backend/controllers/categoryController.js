const Category = require("../models/Category");
const Blog = require("../models/Blog");

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

      
        const counts = await Blog.aggregate([
            { $match: { status: "published" } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        counts.forEach(c => {
            countMap[c._id] = c.count;
        });

        const result = categories.map(cat => ({
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            color: cat.color,
            articleCount: countMap[cat.name] || 0
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const existing = await Category.findOne({
            $or: [{ name: { $regex: new RegExp(`^${name}$`, "i") } }, { slug }]
        });

        if (existing) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = await Category.create({
            name: name.trim(),
            slug,
            description: description || "",
            color: color || "#0a66c2"
        });

        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        if (name && name !== category.name) {
            const oldName = category.name;
            category.name = name.trim();
            category.slug = name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

           
            await Blog.updateMany({ category: oldName }, { category: category.name });
        }

        if (description !== undefined) category.description = description;
        if (color !== undefined) category.color = color;

        await category.save();

        res.json({ message: "Category updated successfully", category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
