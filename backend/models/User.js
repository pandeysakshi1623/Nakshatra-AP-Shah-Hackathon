const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['PATIENT', 'CAREGIVER'], required: true },
    assignedCaregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Only relevant for patients
    },
    status: {
      type: String,
      enum: ['STABLE', 'REVIEW', 'CRITICAL'],
      default: 'STABLE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
