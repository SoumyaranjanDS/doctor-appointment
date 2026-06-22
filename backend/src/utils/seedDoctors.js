require('dotenv').config({ path: '../../.env' }); // Assuming it's run from the src/utils dir or adjust path as needed
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Use path resolution to reliably find .env
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const seedDoctors = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("No MONGO_URI found in env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing seed data if needed
        // await Doctor.deleteMany({});
        
        // Mock User 1
        const user1 = await User.findOneAndUpdate(
            { email: 'sarah.jenkins@example.com' },
            {
                clerkId: 'seed_doc_1',
                email: 'sarah.jenkins@example.com',
                firstName: 'Sarah',
                lastName: 'Jenkins',
                role: 'doctor',
                profileImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKTG1RgHR1vkAYCaezq-VsXeDAJRHwpgnX6ySs2RbQYQ4hoSNjC6U5F_6-T_7ETbTEtwrLeZKQjdtb9EGrjiG420ufZV3Hp_QEZNecydSzN6JtPyIrD9rJm_JiXCM6na7TAw_OKyIr2Y45Eyo6T9deqTKg9j5ZyADfZFuws3J04E3S3kLtN3aNUYMm7HfAq3roY3YgMXaU3D_z_QO6Vo7Fn_lnlWhBT-0MRvVPzN6tmPA9T7dM3wutrZ6zLoI0Pf_Rj46m8yQaWd8'
            },
            { upsert: true, new: true }
        );

        // Mock Doctor Profile 1
        await Doctor.findOneAndUpdate(
            { userId: user1._id },
            {
                userId: user1._id,
                specialities: ['Cardiology'],
                qualifications: [
                    { degree: 'MD', institution: 'Harvard Medical School', year: 2005 }
                ],
                experienceYears: 15,
                bio: 'Specializing in advanced heart failure and transplant cardiology.',
                consultationFee: 150,
                clinic: {
                    name: 'City Health Hospital',
                    address: 'Downtown',
                    city: 'New York',
                    state: 'NY'
                },
                rating: 4.9,
                reviewCount: 120,
                isVerified: true
            },
            { upsert: true, new: true }
        );

        // Mock User 2
        const user2 = await User.findOneAndUpdate(
            { email: 'michael.chen@example.com' },
            {
                clerkId: 'seed_doc_2',
                email: 'michael.chen@example.com',
                firstName: 'Michael',
                lastName: 'Chen',
                role: 'doctor',
                profileImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKTG1RgHR1vkAYCaezq-VsXeDAJRHwpgnX6ySs2RbQYQ4hoSNjC6U5F_6-T_7ETbTEtwrLeZKQjdtb9EGrjiG420ufZV3Hp_QEZNecydSzN6JtPyIrD9rJm_JiXCM6na7TAw_OKyIr2Y45Eyo6T9deqTKg9j5ZyADfZFuws3J04E3S3kLtN3aNUYMm7HfAq3roY3YgMXaU3D_z_QO6Vo7Fn_lnlWhBT-0MRvVPzN6tmPA9T7dM3wutrZ6zLoI0Pf_Rj46m8yQaWd8' // Same image placeholder
            },
            { upsert: true, new: true }
        );

        // Mock Doctor Profile 2
        await Doctor.findOneAndUpdate(
            { userId: user2._id },
            {
                userId: user2._id,
                specialities: ['Dermatology'],
                experienceYears: 10,
                consultationFee: 120,
                clinic: {
                    name: 'Green Valley Medical Center',
                    address: 'Westside',
                    city: 'New York',
                    state: 'NY'
                },
                rating: 4.8,
                reviewCount: 85,
                isVerified: true
            },
            { upsert: true, new: true }
        );

        console.log('Database seeded with mock doctors!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDoctors();
