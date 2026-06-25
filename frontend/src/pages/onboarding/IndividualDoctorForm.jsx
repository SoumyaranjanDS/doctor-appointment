import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../config/api';

const IndividualDoctorForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    experienceYears: '',
    consultationFee: '',
    bio: '',
    specialities: '',
  });
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [availability, setAvailability] = useState([
    { dayOfWeek: 'Monday', slots: [{ startTime: '09:00', endTime: '17:00' }] }
  ]);

  const addAvailabilitySlot = () => {
    setAvailability([...availability, { dayOfWeek: 'Monday', slots: [{ startTime: '09:00', endTime: '17:00' }] }]);
  };

  const removeAvailabilitySlot = (index) => {
    const newAvail = [...availability];
    newAvail.splice(index, 1);
    setAvailability(newAvail);
  };

  const updateAvailability = (index, field, value) => {
    const newAvail = [...availability];
    if (field === 'dayOfWeek') {
      newAvail[index].dayOfWeek = value;
    } else if (field === 'startTime' || field === 'endTime') {
      newAvail[index].slots[0][field] = value;
    }
    setAvailability(newAvail);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setDocument(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Removed getToken
      
      const data = new FormData();
      data.append('name', formData.name);
      data.append('experienceYears', formData.experienceYears);
      data.append('consultationFee', formData.consultationFee);
      data.append('bio', formData.bio);
      
      const specialitiesArray = formData.specialities.split(',').map(s => s.trim()).filter(s => s);
      data.append('specialities', JSON.stringify(specialitiesArray));
      
      data.append('availability', JSON.stringify(availability));
      data.append('qualifications', JSON.stringify([]));
      
      if (document) {
        data.append('document', document);
      } else {
        throw new Error('Please upload a verification document');
      }

      await api.post('/onboarding/doctor', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/dashboard', { state: { message: 'Application submitted successfully! Please wait for admin approval.' } });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container h-screen w-full flex relative overflow-hidden font-sans">
      <Link to="/" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-white font-label-md z-50 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white/30 hover:bg-white/30 transition-colors">
        <span className="material-symbols-outlined text-[18px]">home</span>
        Return Home
      </Link>

      {/* Background Floating Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="flex w-full h-full relative z-10">
        
        {/* Left Panel */}
        <section className="hidden md:flex w-1/2 relative overflow-hidden bg-primary">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: 'url(/do.png)' }}
          ></div>
          
          {/* Subtle green mask */}
          <div className="absolute inset-0 bg-secondary/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-container/90"></div>
          
          {/* Dotted pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative h-full p-12 lg:p-16 flex flex-col justify-center text-white z-10">
            <h1 className="text-display-lg font-display-lg mb-12 leading-tight">
              Doctor<br/>Registration Portal
            </h1>
            
            <div className="space-y-8">
              {[
                { icon: 'analytics', text: 'Data Analytics' },
                { icon: 'calendar_month', text: 'Online Scheduling' },
                { icon: 'fact_check', text: 'Patient Resulting' },
                { icon: 'shield_person', text: 'OSHA Surveillance' },
                { icon: 'receipt_long', text: 'Invoicing' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-white/90">
                  <span className="material-symbols-outlined text-[24px] opacity-80 font-light bg-white/10 p-2 rounded-xl">{item.icon}</span>
                  <span className="text-label-md font-label-md tracking-wide">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <section className="w-full md:w-1/2 flex flex-col relative bg-white overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center z-10 bg-white/90 backdrop-blur-sm p-6 md:p-8 sticky top-0 border-b border-outline-variant/30">
            <div className="flex items-center gap-2 font-headline-md text-on-surface tracking-tight text-lg">
               <span className="material-symbols-outlined text-primary">health_and_safety</span>
               Premium Healthcare
            </div>
            <div className="bg-surface px-5 py-2 rounded-full border border-outline-variant text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
              Register
            </div>
          </div>

          {/* Scrollable Form Area */}
          <div className="px-8 md:px-14 pt-8 pb-16">
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-8">Onboarding</h2>
            
            {error && <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-6 text-label-md">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" name="name" required value={formData.name} onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface text-body-md"
                  placeholder="Dr. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Specialities</label>
                <input 
                  type="text" name="specialities" required value={formData.specialities} onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface text-body-md"
                  placeholder="e.g. Cardiology, Pediatrics"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Experience (Years)</label>
                  <input 
                    type="number" name="experienceYears" required value={formData.experienceYears} onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface text-body-md"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Consultation Fee (₹)</label>
                  <input 
                    type="number" name="consultationFee" required value={formData.consultationFee} onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface text-body-md"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Bio</label>
                <textarea 
                  name="bio" rows="3" value={formData.bio} onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface text-body-md resize-none"
                  placeholder="Tell us about your practice and approach..."
                />
              </div>

              {/* Weekly Availability */}
              <div className="bg-surface-container-low border border-outline-variant p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-label-sm text-on-surface-variant uppercase tracking-wider mb-0">Weekly Availability</label>
                  <button 
                    type="button" onClick={addAvailabilitySlot}
                    className="text-label-sm text-primary uppercase tracking-wider hover:text-primary-container transition-colors flex items-center"
                  >
                    <span className="material-symbols-outlined text-[16px] mr-1">add</span> Add Slot
                  </button>
                </div>
                
                <div className="space-y-3">
                  {availability.map((avail, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select 
                        value={avail.dayOfWeek}
                        onChange={(e) => updateAvailability(i, 'dayOfWeek', e.target.value)}
                        className="w-1/3 px-3 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-body-md text-on-surface"
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <input 
                        type="time" 
                        value={avail.slots[0].startTime}
                        onChange={(e) => updateAvailability(i, 'startTime', e.target.value)}
                        className="w-[28%] px-3 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-body-md text-on-surface" 
                      />
                      <span className="text-on-surface-variant text-caption">-</span>
                      <input 
                        type="time" 
                        value={avail.slots[0].endTime}
                        onChange={(e) => updateAvailability(i, 'endTime', e.target.value)}
                        className="w-[28%] px-3 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-body-md text-on-surface" 
                      />
                      {availability.length > 1 && (
                        <button 
                          type="button" onClick={() => removeAvailabilitySlot(i)}
                          className="w-[8%] flex items-center justify-center text-error hover:bg-error/10 transition-colors rounded-lg"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Verification Document (PDF/Image)</label>
                <input 
                  type="file" accept="image/*,application/pdf" required onChange={handleFileChange}
                  className="w-full px-5 py-3.5 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface text-body-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-label-sm file:bg-white file:text-on-surface hover:file:bg-surface-variant"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" disabled={loading}
                  className="w-full py-4 bg-primary hover:bg-primary-container hover:text-on-primary-container text-white rounded-full font-label-md tracking-wide transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'SUBMITTING...' : 'REGISTER'}
                </button>
              </div>

            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IndividualDoctorForm;
