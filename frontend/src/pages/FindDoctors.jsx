import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../config/api';

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');

  // AI Symptom Matcher states
  const [symptoms, setSymptoms] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiError, setAiError] = useState(null);
  
  const location = useLocation();

  // Sync URL search query with state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        let url = `/doctors?`;
        if (searchQuery) url += `search=${searchQuery}&`;
        if (selectedSpecialities.length > 0) url += `speciality=${selectedSpecialities.join(',')}&`;
        if (minFee) url += `minFee=${minFee}&`;
        if (maxFee) url += `maxFee=${maxFee}&`;
        
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
  }, [searchQuery, selectedSpecialities, minFee, maxFee]);

  const toggleSpeciality = (spec) => {
    setSelectedSpecialities(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialities([]);
    setMinFee('');
    setMaxFee('');
    setAiRecommendations([]);
    setSymptoms('');
    setAiError(null);
  };

  const handleAnalyzeSymptoms = async (symptomText) => {
    const textToAnalyze = typeof symptomText === 'string' ? symptomText : symptoms;
    if (!textToAnalyze.trim()) return;
    
    if (typeof symptomText === 'string') {
      setSymptoms(symptomText);
    }
    
    setAiLoading(true);
    setAiError(null);
    setAiRecommendations([]);
    
    try {
      const response = await api.post('/ai/recommend-specialist', { symptoms: textToAnalyze });
      if (response.data && response.data.success) {
        setAiRecommendations(response.data.recommendations);
        // Automatically select the top recommendation
        if (response.data.recommendations.length > 0) {
          const topSpeciality = response.data.recommendations[0].speciality;
          setSelectedSpecialities([topSpeciality]); // Overwrite with top recommendation
        }
      } else {
        setAiError(response.data.error || "Failed to analyze symptoms.");
      }
    } catch (err) {
      setAiError(err.response?.data?.error || "Error connecting to AI service.");
    } finally {
      setAiLoading(false);
    }
  };

  // Run initial AI analysis if passed from landing page
  useEffect(() => {
    if (location.state?.initialSymptoms && !symptoms) {
      handleAnalyzeSymptoms(location.state.initialSymptoms);
      // Clear state so it doesn't run again on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state]);

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

        {/* AI Symptom Matcher UI */}
        <div className="mt-8 bg-surface-container-low rounded-[24px] p-6 border border-outline-variant/30 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>
          <h2 className="font-headline-sm text-primary mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            AI Symptom Analyzer
          </h2>
          <p className="font-body-md text-on-surface-variant mb-4">Not sure which doctor to see? Describe your symptoms and our AI will recommend the right specialist.</p>
          
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <textarea
              className="flex-grow w-full bg-surface-container-lowest rounded-xl border border-outline-variant/30 px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none min-h-[80px]"
              placeholder="e.g., I have a severe headache, blurry vision, and feel nauseous..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
            <button 
              onClick={handleAnalyzeSymptoms}
              disabled={aiLoading || !symptoms.trim()}
              className={`whitespace-nowrap px-6 py-4 rounded-xl font-label-md flex items-center justify-center gap-2 transition-all ${
                aiLoading || !symptoms.trim() ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary hover:shadow-4 cursor-pointer'
              }`}
            >
              {aiLoading ? (
                <><span className="animate-spin material-symbols-outlined text-[20px]">sync</span> Analyzing...</>
              ) : (
                <><span className="material-symbols-outlined text-[20px]">psychiatry</span> Analyze Symptoms</>
              )}
            </button>
          </div>

          {aiError && (
            <p className="text-error font-body-sm mt-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span> {aiError}
            </p>
          )}

          {aiRecommendations.length > 0 && (
            <div className="mt-6 p-4 bg-primary-container/20 border border-primary-container rounded-xl animate-fade-in">
              <h3 className="font-label-lg text-on-surface mb-3">Recommended Specialists:</h3>
              <div className="flex flex-col gap-3">
                {aiRecommendations.map((rec, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20">
                    <div className="flex items-start sm:items-center gap-2">
                      {idx === 0 && <span className="material-symbols-outlined text-tertiary" title="Top Match">workspace_premium</span>}
                      <div>
                        <p className="font-bold text-primary">{rec.speciality}</p>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">{rec.reasoning}</p>
                      </div>
                    </div>
                    {idx === 0 && (
                      <span className="mt-2 sm:mt-0 text-[10px] uppercase font-bold tracking-wider bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded-md">Top Match</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-body-sm text-on-surface-variant mt-3 italic text-center">
                We've automatically filtered the doctors list below for <strong>{aiRecommendations[0].speciality}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Left Sidebar Filters */}
      <aside className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-[24px] p-6 sticky top-28">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-md text-[20px] text-on-surface">Filters</h2>
            <button className="font-label-sm text-primary hover:underline cursor-pointer" onClick={resetFilters}>Reset All</button>
          </div>
          
          {/* Speciality */}
          <div className="mb-6">
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-3 uppercase tracking-wider">Speciality</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Psychiatry', 'Gastroenterology', 'Ophthalmology', 'ENT (Otolaryngology)', 'Urology', 'Gynecology', 'General Physician'].map((spec, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    checked={selectedSpecialities.includes(spec)}
                    onChange={() => toggleSpeciality(spec)}
                    className="form-checkbox text-primary rounded border-outline-variant focus:ring-primary h-5 w-5" 
                    type="checkbox"
                  />
                  <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">{spec}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="h-px bg-outline-variant/30 w-full mb-6"></div>
          
          {/* Fee Range */}
          <div className="mb-6">
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-3 uppercase tracking-wider">Consultation Fee (₹)</h3>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={minFee}
                onChange={(e) => setMinFee(e.target.value)}
                className="w-full bg-[#F7FBFF] border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <span className="text-on-surface-variant">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                className="w-full bg-[#F7FBFF] border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              />
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
                      {doctor.averageRating || 'New'} <span className="text-outline-variant font-normal">({doctor.totalReviews || 0})</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-outline-variant/30"></div>
                  <div className="flex flex-col items-center">
                    <span className="font-label-sm text-on-surface-variant mb-1">Consult Fee</span>
                    <span className="font-label-md text-on-surface">₹{doctor.consultationFee}</span>
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
