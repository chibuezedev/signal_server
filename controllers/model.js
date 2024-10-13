const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const fs = require("fs");
const express = require("express");

const AuthenticateToken = require("../middleware/auth");
const Translation = require("../models/translations");

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

      await Translation.create({
        text: letter,
        user: req.user.id,
        translatedText: letter,
      });

      res.json({ letter });
    } catch (error) {
      console.error("Error processing image:", error);
      res
        .status(500)
        .json({ error: "Failed to process image: " + error.message });
    }
  }
);

router.post("/process_sentence", async (req, res) => {
  const { sentence } = req.body;

  if (!Array.isArray(sentence)) {
    return res
      .status(400)
      .json({ error: "Sentence must be an array of strings" });
  }

  // Join the sentence array into a string
  const sentenceStr = sentence.join(" ");

  try {
    // Use Gemini to process the sentence
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(
      `Process and improve the following sentence translated from sign language: ${sentenceStr}`
    );
    const response = await result.response;
    const processedSentence = response.text();

    return res.json({ processed_sentence: processedSentence.split(" ") });
  } catch (error) {
    console.error("Error processing sentence:", error);
    return res.status(500).json({ error: "Failed to process sentence" });
  }
});

module.exports = router;
