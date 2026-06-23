import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const OnboardingSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-container-lowest pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-4">Join Our Medical Network</h1>
        <p className="text-body-lg text-on-surface-variant">
          Select how you want to join our platform to begin the onboarding process.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Patient Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 cursor-pointer flex flex-col items-center text-center transition-all hover:border-primary"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-20 h-20 bg-tertiary/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-tertiary text-[40px]">person_search</span>
          </div>
          <h2 className="text-headline-md font-headline-md text-on-surface mb-4">Patient</h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Join to find top doctors, book appointments, and manage your health journey seamlessly.
          </p>
          <button className="mt-auto w-full py-3 bg-tertiary text-on-tertiary rounded-full font-label-md hover:bg-tertiary-container hover:text-on-tertiary-container transition-colors">
            Continue as Patient
          </button>
        </motion.div>
        {/* Individual Doctor Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 cursor-pointer flex flex-col items-center text-center transition-all hover:border-primary"
          onClick={() => navigate('/onboarding/doctor')}
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-[40px]">person</span>
          </div>
          <h2 className="text-headline-md font-headline-md text-on-surface mb-4">Individual Doctor</h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Join as an independent practitioner. Manage your own schedule, set your fees, and connect directly with patients.
          </p>
          <button className="mt-auto w-full py-3 bg-primary text-white rounded-full font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors">
            Apply as Doctor
          </button>
        </motion.div>

        {/* Clinic Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 cursor-pointer flex flex-col items-center text-center transition-all hover:border-primary"
          onClick={() => navigate('/onboarding/clinic')}
        >
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-secondary text-[40px]">local_hospital</span>
          </div>
          <h2 className="text-headline-md font-headline-md text-on-surface mb-4">Clinic / Hospital</h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Register your healthcare facility. Onboard multiple doctors under your clinic and manage unified schedules and bookings.
          </p>
          <button className="mt-auto w-full py-3 bg-secondary text-on-secondary rounded-full font-label-md hover:bg-secondary-container hover:text-on-secondary-container transition-colors">
            Register Clinic
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingSelection;
