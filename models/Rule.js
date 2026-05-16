import mongoose from 'mongoose';

const RuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  targetType: { type: String, enum: ['campaign', 'adset', 'ad', 'account'], required: true },
  metric: { type: String },
  operator: { type: String },
  threshold: { type: Number },
  minSpent: { type: Number, default: 0 },
  minLeads: { type: Number, default: 0 },
  action: { type: String, required: true },
  percentValue: { type: Number },
  isActive: { type: Boolean, default: true },
  lastExecuted: { type: Date, default: null }
});

export default mongoose.model('Rule', RuleSchema);
