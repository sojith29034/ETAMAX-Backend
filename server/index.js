const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config(); // Load environment variables
const path = require("path");

// Import Routes
const studentRoutes = require("./routes/studentRoutes");
const eventRoutes = require("./routes/eventRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use("/assets/", express.static(path.join(__dirname, "assets")));

// Configure CORS
const allowedOrigins = [
  "https://etamax.netlify.app", // Netlify frontend
  "https://etamax25.vercel.app", // Vercel frontend
  "http://localhost:5173", // Local development
  "http://localhost:5174", // Local development
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });

// Use Routes
app.use("/api", studentRoutes);
app.use("/api", eventRoutes);
app.use("/api", transactionRoutes);

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof Error && err.message === "Not allowed by CORS") {
    return res
      .status(403)
      .json({ error: "CORS policy does not allow this origin" });
  }
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});