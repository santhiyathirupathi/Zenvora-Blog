const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error("MONGO_URI is missing");
        }

        await mongoose.connect(uri);

        console.log("MongoDB Connected Successfully");

    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        throw error;
    }
};

module.exports = connectDB;