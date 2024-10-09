const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const fs = require("fs");
const express = require("express");

const AuthenticateToken = require("../middleware/auth");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const upload = multer({ dest: "uploads/" });
const router = express.Router();


router.post(
    "/translate",
    AuthenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const imagePart = {
        inlineData: {
          data: fs.readFileSync(req.file.path, { encoding: "base64" }),
          mimeType: req.file.mimetype,
        },
      };

      const result = await model.generateContent([
        "What letter of the American Sign Language alphabet does this image show? Respond with only the letter.",
        imagePart,
      ]);

      const response = await result.response;
      const letter = response.text().trim();

      fs.unlinkSync(req.file.path);

      res.json({ letter });
    } catch (error) {
      console.error("Error processing image:", error);
      res
        .status(500)
        .json({ error: "Failed to process image: " + error.message });
    }
  }
);


module.exports = router