const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Import Routes
const studentRoutes = require("./routes/studentRoutes");
const eventRoutes = require("./routes/eventRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

// Initialize Express
const app = express();

// Middleware
app.use(express.json({ limit: "100mb" })); // Increased limit for Base64 data
app.use(cors({ 
  origin: "*", // Allow all origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed methods
  preflightContinue: false, 
  optionsSuccessStatus: 204 
}));
app.use(bodyParser.json({ limit: "100mb" })); // Increased limit for Base64 data

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Use Routes
app.use("/api", studentRoutes);
app.use("/api", eventRoutes);
app.use("/api", transactionRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Handle Undefined Routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Increase timeout settings
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 125 * 1000;