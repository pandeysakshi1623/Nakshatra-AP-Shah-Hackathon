const express = require('express');
const User = require('../models/User');
const VitalsLog = require('../models/VitalsLog');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/login
// Simple demo login — finds user by email, returns user object
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/vitals
// Accepts patient vitals, saves log, runs prediction engine, updates status
// ─────────────────────────────────────────────────────────────────────────────
router.post('/vitals', async (req, res) => {
  try {
    const { patientId, painLevel, mobility, symptoms, isSOS } = req.body;

    // --- Validation ---
    if (!patientId || !painLevel || !mobility) {
      return res.status(400).json({
        success: false,
        message: 'patientId, painLevel, and mobility are required.',
      });
    }

    // --- Save the vitals log ---
    const newLog = new VitalsLog({
      patientId,
      painLevel,
      mobility,
      symptoms: symptoms || [],
      isSOS: isSOS || false,
    });
    await newLog.save();

    // --- Prediction Engine ---
    // Rule: pain > 7 OR SOS triggered → CRITICAL, otherwise → STABLE
    let newStatus = 'STABLE';
    if (Number(painLevel) > 7 || isSOS === true) {
      newStatus = 'CRITICAL';
    }

    // --- Update patient status in DB ---
    const updatedPatient = await User.findByIdAndUpdate(
      patientId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    return res.json({
      success: true,
      status: newStatus,
      log: newLog,
      patient: updatedPatient,
    });
  } catch (error) {
    console.error('POST /api/vitals error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/patients
// Returns all users with role PATIENT, sorted by most recently updated
// ─────────────────────────────────────────────────────────────────────────────
router.get('/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'PATIENT' }).sort({ updatedAt: -1 });
    return res.json({ success: true, patients });
  } catch (error) {
    console.error('GET /api/patients error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vitals/:patientId
// Returns last 10 vitals logs for a specific patient (for sparkline/history)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/vitals/:patientId', async (req, res) => {
  try {
    const logs = await VitalsLog.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 })
      .limit(10);
    return res.json({ success: true, logs });
  } catch (error) {
    console.error('GET /api/vitals/:patientId error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
