import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  product: { type: String, required: true },
  brand: { type: String, required: true },
  status: { type: String, default: 'جديد' },
  timestamp: { type: Date, default: Date.now },
  metaLeadId: { type: String, unique: true, sparse: true }
});

export default mongoose.model('Lead', LeadSchema);
