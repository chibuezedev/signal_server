const mongoose = require("mongoose");

const translationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    language: {
      type: String,
      enum: ["english", "spain", "germany"],
      default: "english",
    },
    text: { type: String, required: true },
    translatedText: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Translation", translationSchema);
