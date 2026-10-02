const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

function parseTimes(startAt, endAt) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (!startAt || !endAt || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: 'Enter valid appointment start and end times.' };
  }
  if (start <= new Date() || end <= start) {
    return { error: 'Choose a future start time and an end time after it.' };
  }
  return { start, end };
}

async function hasConflict(doctorId, start, end, excludedId) {
  const filter = {
    doctor: doctorId,
    status: { $ne: 'Cancelled' },
    startAt: { $lt: end },
    endAt: { $gt: start },
  };
  if (excludedId) filter._id = { $ne: excludedId };
  return Appointment.exists(filter);
}

exports.listMine = async (request, response) => {
  const appointments = await Appointment.find({ user: request.user._id })
    .populate('doctor', 'name specialty imageUrl phone')
    .sort({ startAt: -1 });
  return response.json({ appointments });
};

exports.getOne = async (request, response) => {
  const appointment = await Appointment.findOne({ _id: request.params.id, user: request.user._id })
    .populate('doctor', 'name specialty imageUrl phone');
  if (!appointment) return response.status(404).json({ message: 'Appointment not found.' });
  return response.json({ appointment });
};

exports.create = async (request, response) => {
  const { doctorId, startAt, endAt, reason } = request.body;
  if (!doctorId || !reason?.trim()) {
    return response.status(400).json({ message: 'Doctor and appointment reason are required.' });
  }
  const times = parseTimes(startAt, endAt);
  if (times.error) return response.status(400).json({ message: times.error });
  if (!(await Doctor.exists({ _id: doctorId }))) {
    return response.status(404).json({ message: 'Doctor not found.' });
  }
  if (await hasConflict(doctorId, times.start, times.end)) {
    return response.status(409).json({ message: 'That doctor already has an appointment at this time.' });
  }

  const appointment = await Appointment.create({
    user: request.user._id,
    doctor: doctorId,
    startAt: times.start,
    endAt: times.end,
    reason: reason.trim(),
  });
  await appointment.populate('doctor', 'name specialty imageUrl phone');
  return response.status(201).json({ appointment });
};

exports.update = async (request, response) => {
  const appointment = await Appointment.findOne({ _id: request.params.id, user: request.user._id });
  if (!appointment) return response.status(404).json({ message: 'Appointment not found.' });
  if (appointment.status === 'Cancelled') {
    return response.status(409).json({ message: 'Cancelled appointments cannot be edited.' });
  }

  const doctorId = request.body.doctorId || appointment.doctor.toString();
  const startAt = request.body.startAt ?? appointment.startAt;
  const endAt = request.body.endAt ?? appointment.endAt;
  const reason = request.body.reason ?? appointment.reason;
  if (!reason?.trim()) return response.status(400).json({ message: 'Appointment reason is required.' });
  const times = parseTimes(startAt, endAt);
  if (times.error) return response.status(400).json({ message: times.error });
  if (!(await Doctor.exists({ _id: doctorId }))) {
    return response.status(404).json({ message: 'Doctor not found.' });
  }
  if (await hasConflict(doctorId, times.start, times.end, appointment._id)) {
    return response.status(409).json({ message: 'That doctor already has an appointment at this time.' });
  }

  appointment.set({ doctor: doctorId, startAt: times.start, endAt: times.end, reason: reason.trim() });
  await appointment.save();
  await appointment.populate('doctor', 'name specialty imageUrl phone');
  return response.json({ appointment });
};

exports.cancel = async (request, response) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: request.params.id, user: request.user._id, status: { $ne: 'Cancelled' } },
    { status: 'Cancelled' },
    { new: true }
  ).populate('doctor', 'name specialty imageUrl phone');
  if (!appointment) return response.status(404).json({ message: 'Active appointment not found.' });
  return response.json({ appointment });
};

exports.remove = async (request, response) => {
  const appointment = await Appointment.findOneAndDelete({ _id: request.params.id, user: request.user._id });
  if (!appointment) return response.status(404).json({ message: 'Appointment not found.' });
  return response.status(204).send();
};