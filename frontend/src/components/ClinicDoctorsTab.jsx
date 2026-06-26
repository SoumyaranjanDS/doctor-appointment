import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const ClinicDoctorsTab = () => {
  const [doctors, setDoctors] = useState([]);
  const [realClinicId, setRealClinicId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFinancials, setSelectedFinancials] = useState(null);
  const [showFinancialsModal, setShowFinancialsModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialities: '',
    qualifications: '',
    experienceYears: '',
    consultationFee: '',
    bio: '',
  });
  const [file, setFile] = useState(null);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/dashboard/clinic-doctors');
      setDoctors(res.data.doctors);
      setRealClinicId(res.data.clinicId);
    } catch (err) {
      console.error('Failed to fetch clinic doctors', err);
      toast.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctorFinancials = async (doctorId) => {
    try {
      toast.loading('Fetching financials...', { id: 'financials' });
      const res = await api.get(`/dashboard/clinic-doctors/${doctorId}/financials`);
      setSelectedFinancials(res.data);
      setShowFinancialsModal(true);
      toast.success('Financials loaded', { id: 'financials' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch financials', { id: 'financials' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Verification document is required');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    // Convert comma separated string to JSON array
    data.append('specialities', JSON.stringify(formData.specialities.split(',').map(s => s.trim())));
    data.append('qualifications', JSON.stringify([{ degree: formData.qualifications }]));
    data.append('experienceYears', formData.experienceYears);
    data.append('consultationFee', formData.consultationFee);
    data.append('bio', formData.bio);
    data.append('document', file);
    
    // Default availability for simplicity
    const availability = [
      { dayOfWeek: 'Monday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
      { dayOfWeek: 'Wednesday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
      { dayOfWeek: 'Friday', slots: [{ startTime: '09:00', endTime: '17:00' }] }
    ];
    data.append('availability', JSON.stringify(availability));

    try {
      toast.loading('Adding doctor...', { id: 'add-doctor' });
      await api.post(`/onboarding/clinic/${realClinicId}/doctor`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Doctor added successfully! Pending admin approval.', { id: 'add-doctor' });
      setShowAddModal(false);
      setFormData({ name: '', email: '', specialities: '', qualifications: '', experienceYears: '', consultationFee: '', bio: '' });
      setFile(null);
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add doctor', { id: 'add-doctor' });
    }
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Loading doctors...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-headline-md font-bold text-on-surface">Manage Doctors</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-6 py-2 rounded-full font-bold shadow hover:shadow-lg transition-all"
        >
          Add New Doctor
        </button>
      </div>

      {doctors.length === 0 ? (
        <div className="glass-card rounded-10 p-8 text-center text-on-surface-variant">
          You haven't added any doctors yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map(doc => (
            <div key={doc._id} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant flex flex-col justify-between">
              <div>
                <h3 className="font-headline-sm font-bold">{doc.name}</h3>
                <p className="text-body-md text-on-surface-variant mb-2">{doc.email}</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {doc.specialities?.map(spec => (
                    <span key={spec} className="text-xs px-2 py-1 bg-surface-container-high rounded-full">{spec}</span>
                  ))}
                </div>
                <div className="mb-4">
                  <p className="text-sm flex justify-between items-center">
                    <span>Status: 
                      <span className={`ml-2 font-bold uppercase text-xs px-2 py-1 rounded-full ${
                        doc.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                        doc.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {doc.approvalStatus}
                      </span>
                    </span>
                    
                    <span className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-full text-xs">
                      <span className="material-symbols-outlined text-[#F59E0B] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-on-surface">{doc.averageRating || 'New'}</span>
                      <span className="text-on-surface-variant">({doc.totalReviews || 0})</span>
                    </span>
                  </p>
                </div>
                
                {doc.approvalStatus === 'approved' && doc.generatedPassword && (
                  <div className="bg-primary-container/30 border border-primary/20 p-3 rounded-xl mt-4">
                    <p className="text-xs text-on-surface-variant font-bold mb-1">Generated Credentials</p>
                    <p className="text-sm text-on-surface">Email: <span className="font-mono bg-white px-1 rounded">{doc.email}</span></p>
                    <p className="text-sm text-on-surface">Password: <span className="font-mono font-bold bg-white px-1 rounded tracking-widest">{doc.generatedPassword}</span></p>
                    <p className="text-[10px] text-on-surface-variant mt-2 leading-tight">Share these credentials with the doctor so they can log in.</p>
                  </div>
                )}
                
                <div className="mt-4 border-t border-outline-variant/30 pt-4">
                  <button 
                    onClick={() => fetchDoctorFinancials(doc._id)}
                    className="w-full bg-surface-container-high text-on-surface hover:bg-primary hover:text-white px-4 py-2 rounded-full font-bold text-sm transition-all"
                  >
                    View Financials
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-headline-sm font-bold mb-6">Add New Doctor</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Full Name</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" placeholder="Dr. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Email</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Specialities (comma separated)</label>
                  <input required name="specialities" value={formData.specialities} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" placeholder="Cardiology, General Physician" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Qualifications</label>
                  <input required name="qualifications" value={formData.qualifications} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" placeholder="MBBS, MD" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Experience (Years)</label>
                  <input required type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" placeholder="5" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Consultation Fee (₹)</label>
                  <input required type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" placeholder="500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Short Bio</label>
                <textarea required name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" placeholder="Brief description..." />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Verification Document (ID/License)</label>
                <input required type="file" onChange={handleFileChange} className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 rounded-full border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-full bg-primary text-white font-bold hover:bg-primary/90">Add Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Financials Modal */}
      {showFinancialsModal && selectedFinancials && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-headline-sm font-bold">Financials: {selectedFinancials.doctorName}</h3>
                <p className="text-on-surface-variant">Total Generated Revenue: <span className="font-bold text-primary">₹{selectedFinancials.totalRevenue}</span></p>
              </div>
              <button onClick={() => setShowFinancialsModal(false)} className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center hover:bg-outline-variant/30">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2">
              {selectedFinancials.patientPayments?.length === 0 ? (
                <div className="p-8 text-center bg-surface-container-low rounded-xl">No completed appointments yet.</div>
              ) : (
                <div className="space-y-2">
                  {selectedFinancials.patientPayments.map(payment => (
                    <div key={payment.id} className="flex justify-between items-center p-4 bg-surface-container-lowest border border-outline-variant rounded-xl">
                      <div>
                        <p className="font-bold text-on-surface">{payment.patientName}</p>
                        <p className="text-xs text-on-surface-variant">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                      <p className="font-bold text-primary">₹{payment.amount}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicDoctorsTab;
