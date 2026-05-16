import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/triple_a_db';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ [DATABASE] MongoDB Connected Successfully.');
  } catch (err) {
    console.error('❌ [DATABASE] MongoDB Connection Failed:', err.message);
    console.log('⚠️ Falling back to local JSON storage...');
    // In a real app, we might want to exit, but here we can continue with JSON if needed
  }
};

export default connectDB;
