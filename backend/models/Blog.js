const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: ""
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        tags: {
            type: [String],
            default: []
        },

        author: {
            type: String,
            default: "Tech Editorial Team"
        },

        authorRole: {
            type: String,
            default: "Technology Evangelist"
        },

        authorAvatar: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["draft", "published", "scheduled"],
            default: "draft"
        },

        scheduledPublishDate: {
            type: Date,
            default: null
        },

        featured: {
            type: Boolean,
            default: false
        },

        views: {
            type: Number,
            default: 0
        },

        readingTime: {
            type: Number,
            default: 3
        },

        seoTitle: {
            type: String,
            default: ""
        },

        seoDescription: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);


blogSchema.pre("find", function () {
    
});

module.exports = mongoose.model("Blog", blogSchema);
