require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/doctor-appointment');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dcp.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '123456';

    try {
      await mongoose.connection.collection('users').dropIndex('clerkId_1');
      console.log('Dropped legacy clerkId_1 index');
    } catch (e) {
      console.log('No clerkId_1 index found or already dropped.');
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin already exists in the database.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const newAdmin = new User({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'admin'
    });

    await newAdmin.save();
    console.log('Admin seeded successfully in the database.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
