import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [applications, setApplications] = useState({
    individualDoctors: [],
    clinics: [],
    clinicDoctors: []
  });
  const [appointmentsData, setAppointmentsData] = useState({
    appointments: [],
    platformRevenue: 0
  });
  const [activeTab, setActiveTab] = useState('individualDoctors');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [appsRes, apptsRes] = await Promise.all([
        api.get('/admin/applications'),
        api.get('/admin/appointments')
      ]);
      setApplications(appsRes.data);
      setAppointmentsData(apptsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (type, id, action, reason = '') => {
    try {
      await api.put(`/admin/applications/${type}/${id}/${action}`, { reason });
      fetchData(); // Refresh list
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
              logout();
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
            { id: 'clinicDoctors', label: 'Clinic Doctors' },
            { id: 'appointments', label: 'Appointments & Revenue' }
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
        <div className="max-w-4xl">
          {activeTab === 'appointments' ? (
            <div>
              <div className="bg-primary-container text-on-primary-container rounded-2xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm">
                <div>
                  <h2 className="text-headline-md font-bold mb-1">Total Platform Revenue</h2>
                  <p className="text-body-md opacity-90">Aggregated from all completed transactions</p>
                </div>
                <div className="text-display-md font-bold mt-4 md:mt-0">${appointmentsData.platformRevenue}</div>
              </div>
              
              <h2 className="text-headline-sm font-bold mb-4">All Appointments</h2>
              {appointmentsData.appointments.length === 0 ? (
                <p className="text-body-lg text-on-surface-variant">No appointments have been made yet.</p>
              ) : (
                <div className="space-y-4">
                  {appointmentsData.appointments.map(app => (
                    <div key={app._id} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant flex justify-between items-center">
                      <div>
                        <p className="font-label-lg font-bold text-on-surface">{new Date(app.date).toLocaleDateString()} at {app.startTime}</p>
                        <p className="text-on-surface-variant mt-1">Patient: {app.patientId?.firstName} {app.patientId?.lastName}</p>
                        <p className="text-on-surface-variant">Doctor: Dr. {app.doctorId?.name}</p>
                        <p className="text-primary font-bold mt-2">Amount: ${app.amount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs px-3 py-1 bg-surface-container-high rounded-full uppercase tracking-wider mb-2 inline-block">{app.status}</p>
                        <br/>
                        <p className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block ${app.paymentStatus === 'paid' ? 'bg-[#4EF27A]/20 text-[#002108]' : 'bg-surface-variant text-on-surface-variant'}`}>
                          Payment: {app.paymentStatus}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            applications[activeTab]?.length === 0 ? (
              <p className="text-body-lg text-on-surface-variant">No pending applications in this queue.</p>
            ) : (
              applications[activeTab]?.map(item => renderCard(item, activeTab === 'clinics' ? 'clinic' : 'doctor'))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
