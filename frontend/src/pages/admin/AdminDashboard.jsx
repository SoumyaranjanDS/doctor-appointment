import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState({
    individualDoctors: [],
    clinics: [],
    clinicDoctors: []
  });
  const [activeTab, setActiveTab] = useState('individualDoctors');
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      const res = await api.get('/admin/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (type, id, action, reason = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      await api.put(`/admin/applications/${type}/${id}/${action}`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchApplications(); // Refresh list
    } catch (err) {
      alert(`Failed to ${action} application`);
    }
  };

  const renderCard = (item, type) => (
    <div key={item._id} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-headline-sm font-headline-sm text-on-surface">{item.name}</h3>
          {type === 'doctor' && item.userId && (
            <p className="text-body-md text-on-surface-variant">{item.userId.email}</p>
          )}
          {type === 'clinic' && item.ownerId && (
            <p className="text-body-md text-on-surface-variant">Owner: {item.ownerId.email}</p>
          )}
          {type === 'clinic' && (
            <p className="text-body-md text-on-surface-variant">{item.city}, {item.state}</p>
          )}
        </div>
        <a 
          href={item.documentUrl} 
          target="_blank" 
          rel="noreferrer"
          className="text-primary hover:underline font-label-md flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">description</span>
          View Document
        </a>
      </div>
      
      <div className="mt-6 flex gap-4">
        <button 
          onClick={() => handleAction(type, item._id, 'approve')}
          className="px-6 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-full font-label-md transition-colors"
        >
          Approve
        </button>
        <button 
          onClick={() => handleAction(type, item._id, 'reject', 'Does not meet criteria')}
          className="px-6 py-2 bg-error/10 text-error hover:bg-error/20 rounded-full font-label-md transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="p-12 text-center">Loading applications...</div>;

  return (
    <div className="min-h-screen bg-surface-container-lowest pt-24 pb-12 px-4 md:px-12">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Admin Dashboard</h1>
          <button 
            onClick={() => {
              localStorage.removeItem('adminToken');
              navigate('/admin/login');
            }}
            className="px-6 py-2 bg-error/10 text-error rounded-full font-label-md hover:bg-error/20 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-outline-variant mb-8">
          {[
            { id: 'individualDoctors', label: 'Individual Doctors' },
            { id: 'clinics', label: 'Clinics' },
            { id: 'clinicDoctors', label: 'Clinic Doctors' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-4 font-label-md text-label-md transition-colors ${
                activeTab === tab.id 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label} ({applications[tab.id]?.length || 0})
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-3xl">
          {applications[activeTab]?.length === 0 ? (
            <p className="text-body-lg text-on-surface-variant">No pending applications in this queue.</p>
          ) : (
            applications[activeTab]?.map(item => renderCard(item, activeTab === 'clinics' ? 'clinic' : 'doctor'))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
