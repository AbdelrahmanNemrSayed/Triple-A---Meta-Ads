import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['system', 'success', 'warning', 'danger', 'info'], default: 'info' },
  message: { type: String, required: true }
});

export default mongoose.model('Log', LogSchema);
