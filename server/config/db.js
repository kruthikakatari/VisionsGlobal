import mongoose from 'mongoose';

// Shared MongoDB connection used by every model/route in the app.
// Reads MONGODB_URI from .env (see server/.env.example) — matches the var
// name Member 1's server.js/README already use, so both stay compatible.
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/visions-learn';

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

export default connectDB;
