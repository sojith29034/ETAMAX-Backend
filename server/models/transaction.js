const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event', // Assuming you have an Event model for events
    required: true,
  },
  enrolledId: {
    type: String,
    required: true,
  },
  teamMembers: {
    type: [String], // Array of team member roll numbers or IDs
    required: true,
  },
  teamName: {
    type: String, // New field for team name
    required: false, // Optional if it's not mandatory for individual events
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  payment: {
    type: Number,
    required: true,
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;