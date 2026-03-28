const mongoose = require('mongoose');

const vitalsLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  painLevel: { type: Number, min: 1, max: 10, required: true },
  mobility: { type: String, enum: ['GOOD', 'FAIR', 'POOR'], required: true },
  symptoms: [{ type: String }],
  isSOS: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('VitalsLog', vitalsLogSchema);
