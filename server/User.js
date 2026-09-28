import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, enum: ['CREATOR', 'FACULTY', 'STUDENT'] },
  linkedId: { type: String, required: true },
  department: { type: String, default: 'ALL' },
  semester: { type: Number },
  batchName: { type: String }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);