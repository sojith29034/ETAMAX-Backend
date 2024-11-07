require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const Student = require('../models/student');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Function to generate a 6-digit random password
const generateRandomPassword = () => {
  return crypto.randomBytes(3).toString('hex'); // 6 characters in hex
};

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send registration email
const sendRegistrationEmail = async (studentEmail, rollNumber, rawPassword) => {
  const mailOptions = {
    from: {
      name: 'ETAMAX FCRIT',
      address: process.env.EMAIL_USER,
    },
    to: studentEmail,
    subject: 'Student Registration Success',
    text: `Welcome to our system! Your roll number is: ${rollNumber} and your password is: ${rawPassword}.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Welcome to our system!</p>
        <p>Your roll number is: <strong>${rollNumber}</strong></p>
        <p>Your password is: <strong>${rawPassword}</strong></p>
        <p><a href="https://etamax25.vercel.app/" style="color: #1a73e8; text-decoration: none;">Login here</a></p>
        <p>Best regards,<br>ETAMAX FCRIT Team</p>
      </div>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// POST route to register a new student
router.post('/students', async (req, res) => {
  const { name, rollNumber, email } = req.body;
  const rawPassword = generateRandomPassword();

  try {
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const student = new Student({ name, rollNumber, email, password: hashedPassword });
    const savedStudent = await student.save();

    const emailSent = await sendRegistrationEmail(email, rollNumber, rawPassword);
    if (emailSent) {
      res.status(200).json({ message: 'Student registered successfully and email sent', student: savedStudent, rawPassword });
    } else {
      res.status(500).json({ message: 'Student registered, but failed to send email' });
    }
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Roll number or email already exists' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Failed to register student', error });
    }
  }
});

// POST route to send an email with a new password to a specific student by email address
router.post('/students/send-email', async (req, res) => {
  const { email } = req.body;

  try {
    // Find the student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate a new password and hash it
    const newRawPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newRawPassword, 10);

    // Update the student's password in the database with the hashed version
    student.password = hashedPassword;
    await student.save();

    // Send the new password via email
    const emailSent = await sendRegistrationEmail(student.email, student.rollNumber, newRawPassword);

    if (emailSent) {
      res.status(200).json({ message: `Email sent to ${student.email} with a new password` });
    } else {
      res.status(500).json({ message: `Failed to send email to ${student.email}` });
    }
  } catch (error) {
    console.error('Error sending email with new password:', error);
    res.status(500).json({ message: 'Server error while sending email' });
  }
});


// DELETE route to remove a student by ID
router.delete('/students/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted successfully', student: deletedStudent });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student', error });
  }
});


// GET route to retrieve all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find({});
    res.status(200).json(students);
  } catch (error) {
    console.error('Error retrieving students:', error);
    res.status(500).json({ message: 'Failed to retrieve students' });
  }
});

// GET route to retrieve a specific student by ID
router.get('/students/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error('Error retrieving student:', error);
    res.status(500).json({ message: 'Failed to retrieve student', error });
  }
});

// PUT route to update a student by ID
router.put('/students/:id', async (req, res) => {
  const { id } = req.params;
  const { name, rollNumber, email } = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(id, { name, rollNumber, email }, { new: true });
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student', error });
  }
});


// POST route for student login
router.post('/login', async (req, res) => {
  const { rollNumber, password } = req.body;

  try {
    const student = await Student.findOne({ rollNumber });
    if (!student || !(await bcrypt.compare(password, student.password))) {
      return res.status(401).json({ message: 'Invalid roll number or password' });
    }
    res.status(200).json({ message: 'Login successful', rollNumber });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET route to retrieve a specific student by roll number
router.get('/students/rollNo/:rollNumber', async (req, res) => {
  const { rollNumber } = req.params;

  try {
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error('Error retrieving student:', error);
    res.status(500).json({ message: 'Failed to retrieve student', error });
  }
});

module.exports = router;