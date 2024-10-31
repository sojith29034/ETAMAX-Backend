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

// Configure Nodemailer transport using Microsoft's SMTP (Outlook/Office 365)
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.OUTLOOK_USER,
    pass: process.env.OUTLOOK_PASS,
  }
});

// Function to send registration email
const sendRegistrationEmail = async (studentEmail, rollNumber, rawPassword) => {
  const mailOptions = {
    from: '"Sojith" <sojithsunny29034@gmail.com>',
    to: studentEmail,
    subject: 'Student Registration Success',
    text: `Welcome to our system! Your roll number is: ${rollNumber} and your password is: ${rawPassword}.`
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

  // Generate a random password
  const rawPassword = generateRandomPassword();

  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  try {
    const student = new Student({ 
      name, 
      rollNumber, 
      email, 
      password: hashedPassword
    });

    const savedStudent = await student.save();

    // Send registration email after saving the student
    const emailSent = await sendRegistrationEmail(email, rollNumber, rawPassword);

    if (emailSent) {
      res.status(200).json({ 
        message: 'Student registered successfully and email sent', 
        student: savedStudent,
        rawPassword
      });
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
  // console.log('PUT request received for ID:', req.params.id);
  const { id } = req.params;
  const { name, rollNumber, email } = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { name, rollNumber, email },
      { new: true } // Return the updated document
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student', error });
  }
});





// For students to login
router.post('/login', async (req, res) => {
  const { rollNumber, password } = req.body;

  try {
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(401).json({ message: 'Invalid roll number or password' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
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
  console.log('Fetching student with roll number:', rollNumber); // Debug log

  try {
    const student = await Student.findOne({ rollNumber });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve student', error });
  }
});


module.exports = router;