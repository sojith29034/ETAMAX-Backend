const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const multer = require('multer');


// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'assets/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });


// Route to create a new event
router.post('/events', upload.single('eventBanner'), async (req, res) => {
  try {
    const { eventName, eventDetails, entryFees, eventCategory, eventDay, startTime, endTime, maxSeats, teamSize, whatsapp, isFeatured, dept } = req.body;
    const parsedIsFeatured = isFeatured === 'on';
    
    // Save eventBanner as the file path
    const eventBanner = req.file ? req.file.path : null;

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

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Route to fetch all events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Route to delete a single event by ID
router.delete('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully', event: deletedEvent });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Route to delete multiple events by IDs
router.post('/events/delete-multiple', async (req, res) => {
  try {
    const { eventIds } = req.body;
    const result = await Event.deleteMany({ _id: { $in: eventIds } });

    res.status(200).json({ message: 'Selected events deleted successfully', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting events:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


// Get a specific event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a specific event by ID
router.put('/events/:id', async (req, res) => {
  try {
    // Validate allowed fields
    const allowedUpdates = [
      'eventName',
      'eventDetails',
      'entryFees',
      'eventCategory',
      'eventDay',
      'startTime',
      'endTime',
      'maxSeats',
      'teamSize',
      'whatsapp',
      'isFeatured',
      'dept',
      'eventBanner',
    ];

    const updates = req.body;
    // const isValidOperation = updates.every((key) => allowedUpdates.includes(key));

    console.log("Event ID:", req.params.id);
    console.log("Request Body:", req.body);
    // console.log("Allowed Updates:", updates.every((key) => allowedUpdates.includes(key)));
    console.log("Updates Attempted:", req.body);
    // console.log("Allowed Fields Validation:", isValidOperation);

    // if (!isValidOperation) {
    //   return res.status(400).json({ message: 'Invalid updates!' });
    // }

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;