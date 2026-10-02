const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.list = async (request, response) => {
  const filter = {};
  if (request.query.search) {
    const escaped = String(request.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: new RegExp(escaped, 'i') }, { specialty: new RegExp(escaped, 'i') }];
  }
  const doctors = await Doctor.find(filter).sort({ name: 1 });
  return response.json({ doctors });
};

exports.getOne = async (request, response) => {
  const doctor = await Doctor.findById(request.params.id);
  if (!doctor) return response.status(404).json({ message: 'Doctor not found.' });
  return response.json({ doctor });
};

exports.create = async (request, response) => {
  const doctor = await Doctor.create({ ...request.body, imageUrl: request.file ? `/uploads/${request.file.filename}` : '' });
  return response.status(201).json({ doctor });
};

exports.update = async (request, response) => {
  const fields = ['name', 'specialty', 'email', 'phone', 'description'];
  const changes = Object.fromEntries(fields.filter((field) => request.body[field] !== undefined).map((field) => [field, request.body[field]]));
  if (request.file) changes.imageUrl = `/uploads/${request.file.filename}`;

  const doctor = await Doctor.findByIdAndUpdate(request.params.id, changes, {
    new: true,
    runValidators: true,
  });
  if (!doctor) return response.status(404).json({ message: 'Doctor not found.' });
  return response.json({ doctor });
};

exports.remove = async (request, response) => {
  if (await Appointment.exists({ doctor: request.params.id, status: { $ne: 'Cancelled' } })) {
    return response.status(409).json({ message: "Cancel this doctor's active appointments before deleting the doctor." });
  }
  const doctor = await Doctor.findByIdAndDelete(request.params.id);
  if (!doctor) return response.status(404).json({ message: 'Doctor not found.' });
  return response.status(204).send();
};