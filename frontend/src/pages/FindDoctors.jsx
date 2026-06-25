import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const url = searchQuery ? `/doctors?search=${searchQuery}` : `/doctors`;
        const response = await api.get(url);
        
        if (response.data && response.data.success) {
          setDoctors(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch doctors");
        }
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-10 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
      {/* Header & Search */}
      <div className="lg:col-span-12 mb-4">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-6">Find Specialist Doctors</h1>
        <div className="glass-card rounded-full p-2 flex items-center gap-2 max-w-3xl">
          <div className="flex-grow flex items-center bg-[#F7FBFF] rounded-full px-4 py-3 border border-transparent focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <span className="material-symbols-outlined text-outline mr-3">search</span>
            <input 
              className="w-full bg-transparent border-none focus:ring-0 p-0 font-body-md text-on-surface placeholder:text-outline-variant" 
              placeholder="Search doctors, specialities, or symptoms..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-grow flex items-center bg-[#F7FBFF] rounded-full px-4 py-3 border border-transparent focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all hidden md:flex">
            <span className="material-symbols-outlined text-outline mr-3">location_on</span>
            <input className="w-full bg-transparent border-none focus:ring-0 p-0 font-body-md text-on-surface placeholder:text-outline-variant" placeholder="Location" type="text"/>
          </div>
          <button className="bg-primary text-on-primary rounded-full px-8 py-3 font-label-md text-label-md hover:shadow-6 transition-all flex-shrink-0 cursor-pointer">Search</button>
        </div>
      </div>

      {/* Left Sidebar Filters */}
      <aside className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-[24px] p-6 sticky top-28">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-md text-[20px] text-on-surface">Filters</h2>
            <button className="font-label-sm text-primary hover:underline cursor-pointer" onClick={() => setSearchQuery('')}>Reset All</button>
          </div>
          
          {/* Speciality */}
          <div className="mb-6">
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-3 uppercase tracking-wider">Speciality</h3>
            <div className="space-y-2">
              {['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics'].map((spec, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <input defaultChecked={i===0} className="form-checkbox text-primary rounded border-outline-variant focus:ring-primary h-5 w-5" type="checkbox"/>
                  <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">{spec}</span>
                </label>
              ))}
              <button className="font-label-sm text-primary hover:underline mt-2 inline-flex items-center cursor-pointer">+ View More</button>
            </div>
          </div>
          
          <div className="h-px bg-outline-variant/30 w-full mb-6"></div>
          
          {/* Availability */}
          <div className="mb-6">
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-3 uppercase tracking-wider">Availability</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary font-label-sm transition-colors cursor-pointer">Today</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary font-label-sm transition-colors cursor-pointer">Tomorrow</button>
              <button className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary font-label-sm transition-colors cursor-pointer">Next 7 Days</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Grid of Doctor Cards */}
      <section className="lg:col-span-9">
        <div className="flex justify-between items-center mb-6">
          <p className="font-body-md text-on-surface-variant">Showing <span className="font-bold text-on-surface">{doctors.length}</span> doctors available</p>
          <div className="flex items-center gap-2">
            <span className="font-label-md text-on-surface-variant">Sort by:</span>
            <select className="bg-transparent border-none font-label-md text-primary focus:ring-0 cursor-pointer pr-8">
              <option>Relevance</option>
              <option>Rating: High to Low</option>
              <option>Fee: Low to High</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-error-container text-on-error-container p-4 rounded-10">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {doctors.map(doctor => (
              <div key={doctor._id} className="glass-card rounded-[24px] p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <img 
                      className="w-full h-full object-cover rounded-full border-2 border-white shadow-2" 
                      alt={`Dr. ${doctor.userId?.firstName}`} 
                      src={doctor.userId?.profileImageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCKTG1RgHR1vkAYCaezq-VsXeDAJRHwpgnX6ySs2RbQYQ4hoSNjC6U5F_6-T_7ETbTEtwrLeZKQjdtb9EGrjiG420ufZV3Hp_QEZNecydSzN6JtPyIrD9rJm_JiXCM6na7TAw_OKyIr2Y45Eyo6T9deqTKg9j5ZyADfZFuws3J04E3S3kLtN3aNUYMm7HfAq3roY3YgMXaU3D_z_QO6Vo7Fn_lnlWhBT-0MRvVPzN6tmPA9T7dM3wutrZ6zLoI0Pf_Rj46m8yQaWd8"}
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-secondary rounded-full border-2 border-white" title="Available"></div>
                  </div>
                  <div>
                    <Link to={`/doctor/${doctor._id}`}><h3 className="font-headline-md text-[18px] text-on-surface group-hover:text-primary transition-colors">Dr. {doctor.userId?.firstName} {doctor.userId?.lastName}</h3></Link>
                    <p className="font-label-md text-primary mb-1">{doctor.specialities?.[0]}</p>
                    <p className="font-label-sm text-on-surface-variant">{doctor.qualifications?.[0]?.degree} • {doctor.experienceYears} Yrs Exp.</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4 px-2 py-3 bg-surface-container-low rounded-[16px]">
                  <div className="flex flex-col items-center">
                    <span className="font-label-sm text-on-surface-variant mb-1">Rating</span>
                    <div className="flex items-center gap-1 font-label-md text-on-surface">
                      <span className="material-symbols-outlined text-[16px] text-[#FFB400]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      {doctor.rating} <span className="text-outline-variant font-normal">({doctor.reviewCount})</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-outline-variant/30"></div>
                  <div className="flex flex-col items-center">
                    <span className="font-label-sm text-on-surface-variant mb-1">Consult Fee</span>
                    <span className="font-label-md text-on-surface">${doctor.consultationFee}</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <Link to={`/doctor/${doctor._id}`} className="w-full bg-[#4EF27A] text-[#002108] font-label-md text-label-md py-3 rounded-full hover:shadow-6 hover:bg-[#3ae36d] transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
            
            {doctors.length === 0 && (
              <div className="col-span-full text-center py-12 text-on-surface-variant">
                No doctors found matching your search.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default FindDoctors;
