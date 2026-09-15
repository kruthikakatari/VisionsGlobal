import mongoose from 'mongoose';

// Shared MongoDB connection used by every model/route in the app.
// Reads MONGO_URI from .env (see server/.env.example).
export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not set. Add it to server/.env (see .env.example).');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

export default connectDB;
