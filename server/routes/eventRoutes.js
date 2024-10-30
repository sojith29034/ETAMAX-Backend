const express = require('express');
const router = express.Router();
const Event = require('../models/event');

// Route to create a new event
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

module.exports = router;