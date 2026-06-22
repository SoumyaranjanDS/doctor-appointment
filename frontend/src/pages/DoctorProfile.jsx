import React from 'react';
import { Link } from 'react-router-dom';

const DoctorProfile = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-5 md:px-10 py-section-gap grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      {/* Left Column: Doctor Details (8 cols) */}
      <div className="lg:col-span-8 space-y-section-gap">
        {/* Hero Profile Card */}
        <div className="glass-card rounded-10 p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-fixed/30 rounded-full blur-3xl -z-10 group-hover:bg-primary-fixed/40 transition-colors duration-500"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary-container/20 rounded-full blur-2xl -z-10"></div>
          <div className="relative w-32 h-32 md:w-48 md:h-48 shrink-0">
            <img className="w-full h-full object-cover rounded-full border-4 border-white shadow-[0px_8px_24px_rgba(11,95,165,0.15)]" alt="Dr. Sarah Jenkins" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTkbyJIDkEKTqPxU04JLNaN58Pu6m6mC_EnhPaL_cmG1WW4NKzjWRmQ8_i1pcHSad2XX0yyNpdE60Op8Pe6ZJYLFNe9dzTmjvEEShK0_iFbPRyESwAAC0Tx3lpx1_30ezyGGk6T9WuXmwnVuJgSzsuXUqKcemYDrTsyq2MxaXJjleEAFkUVHSkqhlYhzLpyfMHzc5fpipaOjbRBC-MDi0xLCGHlJN4_Nd2CqL-1Q2V86wPv9nOhEO7CT1Sv06JPas2q5QZE7Obiw0"/>
            <div className="absolute bottom-2 right-2 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-4" title="Verified Professional">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <div className="flex-grow space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">Dr. Sarah Jenkins</h1>
                <p className="font-body-lg text-body-lg text-primary font-medium">Senior Cardiologist, MD, FACC</p>
              </div>
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-1 bg-surface-container-high px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-md text-label-md text-on-surface">4.9</span>
                  <span className="font-body-md text-body-md text-on-surface-variant text-2">(124 reviews)</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 bg-surface-container-low text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm border border-outline-variant/30">
                <span className="material-symbols-outlined text-[16px]">stethoscope</span> Cardiology
              </span>
              <span className="inline-flex items-center gap-1.5 bg-surface-container-low text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm border border-outline-variant/30">
                <span className="material-symbols-outlined text-[16px]">translate</span> English, Spanish
              </span>
              <span className="inline-flex items-center gap-1.5 bg-surface-container-low text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm border border-outline-variant/30">
                <span className="material-symbols-outlined text-[16px]">work_history</span> 15+ Years Exp.
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pt-2">
              Specializing in advanced heart failure and transplant cardiology. Dedicated to providing compassionate, comprehensive cardiovascular care using the latest minimally invasive techniques.
            </p>
          </div>
        </div>

        {/* Bento Grid Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-6 p-6 col-span-1 md:col-span-2">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span> About Dr. Jenkins
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Dr. Sarah Jenkins is a board-certified cardiologist with over 15 years of clinical experience. She completed her fellowship at the prestigious Johns Hopkins Medical Center and has since been a pioneer in non-invasive cardiac imaging. Her patient-first philosophy ensures that every treatment plan is tailored to the individual's lifestyle and specific medical needs, prioritizing long-term heart health and preventative care.
            </p>
          </div>

          <div className="glass-card rounded-6 p-6">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2 text-10">
              <span className="material-symbols-outlined text-primary">school</span> Education
            </h2>
            <ul className="space-y-4">
              <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-primary before:rounded-full">
                <h3 className="font-label-md text-label-md text-on-surface">MD, Harvard Medical School</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-2">Graduated 2005</p>
              </li>
              <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-primary-container before:rounded-full">
                <h3 className="font-label-md text-label-md text-on-surface">Residency, Mass General</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-2">Internal Medicine, 2005-2008</p>
              </li>
            </ul>
          </div>

          <div className="glass-card rounded-6 p-6">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2 text-10">
              <span className="material-symbols-outlined text-primary">medical_services</span> Specializations
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className="bg-primary-container/10 text-primary-container font-label-md text-label-md px-3 py-1 rounded-full border border-primary-container/20">Echocardiography</span>
              <span className="bg-primary-container/10 text-primary-container font-label-md text-label-md px-3 py-1 rounded-full border border-primary-container/20">Heart Failure</span>
              <span className="bg-primary-container/10 text-primary-container font-label-md text-label-md px-3 py-1 rounded-full border border-primary-container/20">Preventive Cardiology</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Sticky Booking Card (4 cols) */}
      <div className="lg:col-span-4 relative">
        <div className="glass-panel rounded-6 p-6 sticky top-28">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-outline-variant/20 pb-4">Book Appointment</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-label-md text-label-md text-on-surface">Select Date</h3>
              <span className="font-body-md text-body-md text-primary font-medium text-2">October 2024</span>
            </div>
            <div className="flex justify-between gap-2 overflow-x-auto pb-2 hide-scrollbar">
              <button className="flex flex-col items-center justify-center w-14 h-16 rounded-10 border border-outline-variant/30 bg-surface-container-lowest hover:border-primary hover:bg-primary-fixed/20 transition-all shrink-0 cursor-pointer">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Mon</span>
                <span className="font-label-md text-label-md text-on-surface text-6">14</span>
              </button>
              <button className="flex flex-col items-center justify-center w-14 h-16 rounded-10 border border-primary bg-primary text-on-primary shadow-[0px_4px_12px_rgba(0,71,127,0.2)] shrink-0 transform scale-105 cursor-pointer">
                <span className="font-label-sm text-label-sm text-primary-fixed">Tue</span>
                <span className="font-label-md text-label-md text-on-primary text-6">15</span>
              </button>
              <button className="flex flex-col items-center justify-center w-14 h-16 rounded-10 border border-outline-variant/30 bg-surface-container-lowest hover:border-primary hover:bg-primary-fixed/20 transition-all shrink-0 cursor-pointer">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Wed</span>
                <span className="font-label-md text-label-md text-on-surface text-6">16</span>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-label-md text-label-md text-on-surface mb-3">Select Time Slot</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 font-label-sm text-label-sm text-outline mt-2 mb-1">Morning</div>
              <button className="py-2 rounded-6 border border-outline-variant/30 bg-surface-container-lowest font-body-md text-body-md text-on-surface text-2 hover:border-primary hover:text-primary transition-colors cursor-pointer">09:00 AM</button>
              <button className="py-2 rounded-6 border border-outline-variant/30 bg-surface-container-lowest font-body-md text-body-md text-on-surface text-2 hover:border-primary hover:text-primary transition-colors cursor-pointer">10:30 AM</button>
              <button className="py-2 rounded-6 border border-outline-variant/10 bg-surface-variant/20 font-body-md text-body-md text-on-surface-variant text-2 opacity-50 line-through cursor-not-allowed" disabled>11:00 AM</button>
            </div>
          </div>

          <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-6 border border-outline-variant/20 mb-6">
            <span className="font-body-md text-body-md text-on-surface-variant">Consultation Fee</span>
            <span className="font-headline-md text-headline-md text-primary">$150</span>
          </div>

          <button className="w-full bg-[#4EF27A] text-[#002108] font-label-md text-label-md text-6 py-4 rounded-full hover:shadow-6 hover:-translate-y-0.5 transition-all duration-300 shadow-[0px_4px_20px_rgba(78,242,122,0.4)] flex justify-center items-center gap-2 cursor-pointer">
            Continue to Booking <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
