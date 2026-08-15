const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/skillsync';

  if (primaryUri) {
    try {
      console.log(`Connecting to live MongoDB Atlas...`);
      const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 10000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn(`Primary MongoDB Connection Warning (${error.message}). Retrying with local MongoDB fallback...`);
    }
  }

  try {
    const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    return conn;
  } catch (fallbackError) {
    console.error(`MongoDB Connection Error: ${fallbackError.message}`);
    // Keep server running so HTTP endpoints remain active
  }
};

module.exports = connectDB;
