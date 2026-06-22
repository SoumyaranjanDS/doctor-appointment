const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Get all doctors with optional filtering
const getAllDoctors = async (req, res) => {
    try {
        const { speciality, search } = req.query;
        let query = {};

        if (speciality) {
            query.specialities = { $in: [new RegExp(speciality, 'i')] };
        }

        // We populate the user details (name, image) to send back with the doctor profile
        let doctors = await Doctor.find(query).populate('userId', 'firstName lastName profileImageUrl email');

        // If there's a text search, filter by name
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            doctors = doctors.filter(doc => 
                searchRegex.test(doc.userId.firstName) || 
                searchRegex.test(doc.userId.lastName)
            );
        }

        res.status(200).json({ success: true, data: doctors });
    } catch (error) {
        console.error('Error in getAllDoctors:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch doctors' });
    }
};

// Get single doctor by ID
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('userId', 'firstName lastName profileImageUrl email');
        
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        res.status(200).json({ success: true, data: doctor });
    } catch (error) {
        console.error('Error in getDoctorById:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch doctor' });
    }
};

module.exports = {
    getAllDoctors,
    getDoctorById
};
