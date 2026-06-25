import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

const ClinicDoctorForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    experienceYears: '',
    consultationFee: '',
    bio: '',
    specialities: '',
  });
  
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

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      // We need the clinicId. Let's assume the backend fetches the clinicId from the current user (clinic owner),
      // OR we just send it to a generic `/clinic/doctor` endpoint and backend resolves `clinicId`.
      // Quick fetch to get clinicId of current user
      const userRes = await api.get('/user/profile');
      const clinicId = userRes.data.clinicId || 'DUMMY_ID'; // Placeholder logic

      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
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

      await api.post(`/onboarding/clinic/${clinicId}/doctor`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      navigate('/dashboard', { state: { message: 'Clinic doctor onboarded successfully and is pending admin approval.' } });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred. Make sure your Clinic is approved first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8">
        <h1 className="text-headline-md font-headline-md text-on-surface mb-2">Onboard Clinic Doctor</h1>
        <p className="text-body-md text-on-surface-variant mb-6">Assign schedule and onboard a doctor to your clinic.</p>
        
        {error && <div className="bg-error/10 text-error p-4 rounded-xl mb-6">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-2">Doctor Name</label>
              <input 
                type="text" name="name" required value={formData.name} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Dr. John Smith"
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-2">Email (Optional)</label>
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2">Specialities (comma separated)</label>
            <input 
              type="text" name="specialities" required value={formData.specialities} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Neurology"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-2">Years of Experience</label>
              <input 
                type="number" name="experienceYears" required value={formData.experienceYears} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-2">Consultation Fee (₹)</label>
              <input 
                type="number" name="consultationFee" required value={formData.consultationFee} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Schedule Assignment */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-label-md text-on-surface mb-1">Mandatory Schedule Assignment</h3>
                <p className="text-caption text-on-surface-variant">Define when this doctor is available at your clinic.</p>
              </div>
              <button 
                type="button" onClick={addAvailabilitySlot}
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-label-md hover:bg-primary/20 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">add</span> Add Time
              </button>
            </div>
            
            <div className="space-y-3">
              {availability.map((avail, i) => (
                <div key={i} className="flex items-center gap-3 flex-wrap">
                  <select 
                    value={avail.dayOfWeek}
                    onChange={(e) => updateAvailability(i, 'dayOfWeek', e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-outline-variant bg-white focus:outline-none focus:border-primary"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <input 
                    type="time" 
                    value={avail.slots[0].startTime}
                    onChange={(e) => updateAvailability(i, 'startTime', e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-outline-variant bg-white focus:outline-none focus:border-primary" 
                  />
                  <span className="text-on-surface-variant text-label-md">to</span>
                  <input 
                    type="time" 
                    value={avail.slots[0].endTime}
                    onChange={(e) => updateAvailability(i, 'endTime', e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-outline-variant bg-white focus:outline-none focus:border-primary" 
                  />
                  {availability.length > 1 && (
                    <button 
                      type="button" onClick={() => removeAvailabilitySlot(i)}
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors ml-auto"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2">Doctor Verification Document</label>
            <input 
              type="file" accept="image/*,application/pdf" required onChange={handleFileChange}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-full font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Onboard Doctor'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClinicDoctorForm;
