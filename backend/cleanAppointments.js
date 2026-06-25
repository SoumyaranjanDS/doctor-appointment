const mongoose = require('mongoose');
require('dotenv').config();

const Appointment = require('./src/models/Appointment');

const cleanAppointments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const result = await Appointment.deleteMany({});
        console.log(`Deleted ${result.deletedCount} appointments.`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanAppointments();
