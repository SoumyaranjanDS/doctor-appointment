import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

const ClinicForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
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
      // Removed getToken
      
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      if (document) {
        data.append('document', document);
      } else {
        throw new Error('Please upload a registration document');
      }

      await api.post('/onboarding/clinic', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/dashboard', { state: { message: 'Clinic application submitted successfully! Please wait for admin approval.' } });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8">
        <h1 className="text-headline-md font-headline-md text-on-surface mb-6">Clinic Registration</h1>
        
        {error && <div className="bg-error/10 text-error p-4 rounded-xl mb-6">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2">Clinic Name</label>
            <input 
              type="text" name="name" required value={formData.name} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="City General Hospital"
            />
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2">Street Address</label>
            <input 
              type="text" name="address" required value={formData.address} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-2">City</label>
              <input 
                type="text" name="city" required value={formData.city} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-2">State</label>
              <input 
                type="text" name="state" required value={formData.state} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-2">ZIP Code</label>
              <input 
                type="text" name="zipCode" required value={formData.zipCode} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-2">Phone Number</label>
              <input 
                type="text" name="phone" required value={formData.phone} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2">Clinic Registration Document</label>
            <input 
              type="file" accept="image/*,application/pdf" required onChange={handleFileChange}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary"
            />
            <p className="text-body-sm text-on-surface-variant mt-1">Upload an official document verifying your clinic.</p>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-3 bg-secondary text-on-secondary rounded-full font-label-md hover:bg-secondary-container hover:text-on-secondary-container transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Register Clinic'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClinicForm;
