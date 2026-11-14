const Author = require("../models/Author");

const getAuthors = async (req, res) => {
    try {
        const authors = await Author.find().sort({ name: 1 });
        res.json(authors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAuthor = async (req, res) => {
    try {
        const { name, role, email, bio, avatar } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Author name is required" });
        }

        const author = await Author.create({
            name: name.trim(),
            role: role || "Staff Contributor",
            email: email || "",
            bio: bio || "",
            avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
        });

        res.status(201).json({ message: "Author created successfully", author });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAuthor = async (req, res) => {
    try {
        const author = await Author.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }

        res.json({ message: "Author updated successfully", author });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAuthor = async (req, res) => {
    try {
        const author = await Author.findByIdAndDelete(req.params.id);
        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }
        res.json({ message: "Author deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAuthors,
    createAuthor,
    updateAuthor,
    deleteAuthor
};
