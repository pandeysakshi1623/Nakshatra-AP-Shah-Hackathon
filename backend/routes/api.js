const express = require('express');
const router = express.Router();
const User = require('../models/User');
const VitalsLog = require('../models/VitalsLog');

// POST /api/vitals
router.post('/vitals', async (req, res) => {
  try {
    const { patientId, painLevel, mobility, symptoms, isSOS } = req.body;
    
    // Save the VitalsLog
    const newLog = new VitalsLog({
      patientId,
      painLevel,
      mobility,
      symptoms,
      isSOS
    });
    await newLog.save();

    // Evaluate the data & update User's status
    let status = 'STABLE';
    if (painLevel > 7 || isSOS === true) {
      status = 'CRITICAL';
    }
    
    // Update User
    const updatedUser = await User.findByIdAndUpdate(
      patientId, 
      { status }, 
      { new: true }
    );

    res.status(201).json({ success: true, log: newLog, user: updatedUser });
  } catch (error) {
    console.error('Error saving vitals:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/patients
router.get('/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'PATIENT' });
    res.status(200).json({ success: true, patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
