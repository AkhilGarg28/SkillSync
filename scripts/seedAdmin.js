require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const User = require('../src/models/User');

const seedAdmin = async () => {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillsync';
  const adminEmail = (process.argv[2] || process.env.ADMIN_EMAIL || 'admin@skillsync.com').toLowerCase().trim();
  const adminPassword = process.argv[3] || process.env.ADMIN_PASSWORD || 'admin123456';
  const adminName = process.env.ADMIN_NAME || 'System Admin';

  try {
    console.log(`Connecting to MongoDB at ${mongoUri.replace(/:([^@]+)@/, ':****@')}...`);
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    } catch (connErr) {
      if (mongoUri !== 'mongodb://127.0.0.1:27017/skillsync') {
        console.warn(`Remote MongoDB connection failed (${connErr.message}). Retrying with local MongoDB...`);
        mongoUri = 'mongodb://127.0.0.1:27017/skillsync';
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      } else {
        throw connErr;
      }
    }

    let adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      console.log(`User ${adminEmail} already exists. Promoting to super admin...`);
      adminUser.role = 'admin';
      adminUser.adminRole = 'super_admin';
      adminUser.isVerified = true;
      adminUser.password = adminPassword; // Triggers pre-save hash if modified
      await adminUser.save();
      console.log(`Successfully promoted ${adminEmail} to super admin!`);
    } else {
      console.log(`Creating new super admin user: ${adminEmail}...`);
      adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        adminRole: 'super_admin',
        isVerified: true,
      });
      console.log(`Successfully created super admin user: ${adminEmail} (ID: ${adminUser._id})!`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedAdmin();
