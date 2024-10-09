const express = require("express");
const cors = require("cors");

const connectWithDB = require("./database/config");
const authRoutes = require("./controllers/auth");
const modelRoutes = require("./controllers/model");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "500mb" }));

app.use(authRoutes);
app.use(modelRoutes);

connectWithDB();
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
