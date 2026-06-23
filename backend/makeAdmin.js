const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const user = await User.findOne();
    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`Promoted user ${user.email} to admin.`);
    } else {
      console.log('No user found in DB. Please log in first via the frontend.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
