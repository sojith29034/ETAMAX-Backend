const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const multer = require("multer");

// Configure Multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to create a new event
router.post("/events", upload.single("eventBanner"), async (req, res) => {
  try {
    const {
      eventName,
      eventDetails,
      entryFees,
      eventCategory,
      eventDay,
      startTime,
      endTime,
      maxSeats,
      teamSize,
      whatsapp,
      isFeatured,
      dept,
    } = req.body;

    // Convert `isFeatured` field to a boolean
    const parsedIsFeatured = isFeatured === "on" || isFeatured === true;

    // Convert uploaded file to Base64 format
    let eventBanner = null;
    if (req.file) {
      const fileBuffer = req.file.buffer;
      const fileBase64 = fileBuffer.toString("base64");
      const mimeType = req.file.mimetype;
      eventBanner = `data:${mimeType};base64,${fileBase64}`;
    }

    // Create a new event
    const newEvent = new Event({
      eventName,
      eventBanner,
      eventDetails,
      entryFees,
      eventCategory,
      eventDay,
      startTime,
      endTime,
      maxSeats,
      teamSize,
      whatsapp,
      isFeatured: parsedIsFeatured,
      dept,
    });

    // Save the event to the database
    const savedEvent = await newEvent.save();

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Route to update an existing event by ID
router.put("/events/:id", upload.single("eventBanner"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      eventName,
      eventDetails,
      entryFees,
      eventCategory,
      eventDay,
      startTime,
      endTime,
      maxSeats,
      teamSize,
      whatsapp,
      isFeatured,
      dept,
    } = req.body;

    // Convert `isFeatured` field to a boolean
    const parsedIsFeatured = isFeatured === "on" || isFeatured === true;

    // Prepare update data
    const updateData = {
      eventName,
      eventDetails,
      entryFees,
      eventCategory,
      eventDay,
      startTime,
      endTime,
      maxSeats,
      teamSize,
      whatsapp,
      isFeatured: parsedIsFeatured,
      dept,
    };

    // Convert uploaded file to Base64 format if a new file is uploaded
    if (req.file) {
      const fileBuffer = req.file.buffer;
      const fileBase64 = fileBuffer.toString("base64");
      const mimeType = req.file.mimetype;
      updateData.eventBanner = `data:${mimeType};base64,${fileBase64}`;
    }

    // Update the event in the database
    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation rules are applied
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Route to fetch all events
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Route to get a specific event by ID
router.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a single event by ID
router.delete("/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res
      .status(200)
      .json({ message: "Event deleted successfully", event: deletedEvent });
  } catch (error) {
    console.error("Error deleting event:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Route to delete multiple events by IDs
router.post("/events/delete-multiple", async (req, res) => {
  try {
    const { eventIds } = req.body;
    const result = await Event.deleteMany({ _id: { $in: eventIds } });

    res
      .status(200)
      .json({
        message: "Selected events deleted successfully",
        deletedCount: result.deletedCount,
      });
  } catch (error) {
    console.error("Error deleting events:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;