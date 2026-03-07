const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, default: '123456' },
  role: { type: String, enum: ['admin', 'coach', 'employee'], default: 'coach' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
