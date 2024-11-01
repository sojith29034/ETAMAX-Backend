const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');

// Route to create a new transaction
router.post('/transactions', async (req, res) => {
  try {
    const { eventId, enrolledId, teamMembers, amount } = req.body;

    // Create a new transaction
    const newTransaction = new Transaction({
      eventId,
      enrolledId,
      teamMembers,
      amount,
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Route to fetch all transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get a specific transaction by ID
router.get('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a specific transaction by ID
router.put('/transactions/:id', async (req, res) => {
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTransaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a single transaction by ID
router.delete('/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);

    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully', transaction: deletedTransaction });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Route to delete multiple transactions by IDs
router.post('/transactions/delete-multiple', async (req, res) => {
  try {
    const { transactionIds } = req.body;
    const result = await Transaction.deleteMany({ _id: { $in: transactionIds } });

    res.status(200).json({ message: 'Selected transactions deleted successfully', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting transactions:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;