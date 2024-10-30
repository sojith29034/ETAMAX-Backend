const express = require('express');
const router = express.Router();
const Event = require('../models/event');

router.post('/events', async (req, res) => {
  try {
    const { eventName, eventDetails, entryFees, eventCategory, eventDay, startTime, endTime, maxSeats, teamSize } = req.body;

    // Create a new event
    const newEvent = new Event({
      eventName,
      eventDetails,
      entryFees,
      eventCategory,
      eventDay,
      startTime,
      endTime,
      maxSeats,
      teamSize,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;