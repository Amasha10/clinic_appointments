const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    specialty: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 30 },
<<<<<<< HEAD
    secondaryPhone: { type: String, trim: true, maxlength: 30 },
=======
>>>>>>> 518ea84be0523a42dd0bf1bace8c2501f4a2a458
    description: { type: String, trim: true, maxlength: 1000 },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);