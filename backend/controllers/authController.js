const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing");
    }

    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (user && await user.matchPassword(password)) {
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        }

        return res.status(401).json({
            message: "Invalid email or password"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    login,
    getMe
};