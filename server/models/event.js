const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  eventDetails: {
    type: String,
    required: true,
  },
  entryFees: {
    type: Number,
    required: true,
  },
  eventCategory: {
    type: String,
    required: true,
  },
  eventDay: {
    type: Number,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  maxSeats: {
    type: Number,
    required: true,
  },
  teamSize: {
    type: Number,
    default: 1,
  },
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;