const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const connectDB = require("./config/db");
const seedDB = require("./config/seed");

const blogRoutes = require("./routes/blogRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authorRoutes = require("./routes/authorRoutes");

const Blog = require("./models/Blog");
const Category = require("./models/Category");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

app.use(express.json({ limit: "10mb" }));

app.use("/uploads", express.static(
    path.join(__dirname, "uploads")
));



app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/upload", uploadRoutes);



app.get("/sitemap.xml", async (req, res) => {
    try {
        const blogs = await Blog.find({
            status: "published"
        }).select("slug updatedAt");

        const categories = await Category.find()
            .select("name slug");

        const baseUrl = process.env.CLIENT_URL;

        if (!baseUrl) {
            return res.status(500).send(
                "CLIENT_URL is not configured"
            );
        }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;

        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        xml += `
        <url>
            <loc>${baseUrl}/</loc>
            <priority>1.0</priority>
        </url>`;

        xml += `
        <url>
            <loc>${baseUrl}/blogs</loc>
            <priority>0.9</priority>
        </url>`;

        categories.forEach((cat) => {
            xml += `
            <url>
                <loc>${baseUrl}/blogs?category=${encodeURIComponent(cat.name)}</loc>
                <priority>0.8</priority>
            </url>`;
        });

        blogs.forEach((blog) => {
            xml += `
            <url>
                <loc>${baseUrl}/blog/${blog.slug}</loc>
                <priority>0.7</priority>
            </url>`;
        });

        xml += "</urlset>";

        res.header("Content-Type", "application/xml");
        res.send(xml);

    } catch (error) {
        res.status(500).send("Error generating sitemap");
    }
});



app.get("/robots.txt", (req, res) => {
    const baseUrl = process.env.CLIENT_URL;

    res.type("text/plain").send(
        `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${baseUrl}/sitemap.xml`
    );
});



app.get("/", (req, res) => {
    res.json({
        name: "Lumora API",
        status: "operational",
        version: "1.0.0"
    });
});



const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await seedDB();

        app.listen(PORT, () => {
            console.log(`Lumora API running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();