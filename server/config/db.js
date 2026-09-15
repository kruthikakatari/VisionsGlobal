import mongoose from 'mongoose';

// Shared MongoDB connection used by every model/route in the app.
// Reads MONGODB_URI from .env (see server/.env.example) — matches the var
// name Member 1's server.js/README already use, so both stay compatible.
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to server/.env (see .env.example).');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

export default connectDB;
