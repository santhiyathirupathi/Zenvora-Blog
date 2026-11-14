const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/", (req, res) => {
    upload.single("image")(req, res, (err) => {

        if (err) {
            return res.status(400).json({
                message: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please select an image"
            });
        }

        res.json({
            message: "Image uploaded successfully",
            image: "/uploads/" + req.file.filename
        });
    });
});

module.exports = router;