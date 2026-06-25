import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isProfileCompleted, setIsProfileCompleted] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState('approved');
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, total: 0 });
  
  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [loadingAction, setLoadingAction] = useState(null);

  const menuRef = useRef(null);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let backendRole = null;
        let isCompleted = false;

        try {
          const res = await api.get('/user/profile');
          backendRole = res.data.role;
          isCompleted = res.data.isProfileCompleted;
          setUserRole(backendRole);
          setIsProfileCompleted(isCompleted);
          setApprovalStatus(res.data.approvalStatus || 'approved');
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          if (err.response?.status === 404) {
            backendRole = user?.role || 'patient';
            setUserRole(backendRole);
            setIsProfileCompleted(false);
          } else {
            return;
          }
        }

        if (backendRole === 'admin') {
          navigate('/admin/dashboard');
          return;
        }

        if ((backendRole === 'doctor' || backendRole === 'clinic') && !isCompleted) {
          navigate(`/onboarding/${backendRole}`);
          return;
        }

        if (isCompleted || backendRole === 'patient') {
          fetchAppointments(backendRole);
        }

      } catch (err) {
        console.error('Outer error:', err);
      }
    };

    fetchUserData();
  }, [navigate, user]);

  const fetchAppointments = async (role) => {
    try {
      if (role === 'patient') {
        const res = await api.get('/appointments/patient');
        setAppointments(res.data);
      } else if (role === 'doctor' || role === 'clinic') {
        const res = await api.get('/appointments/doctor');
        setAppointments(res.data.appointments || []);
        setRevenue(res.data.totalRevenue || 0);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  const handleCheckout = async (appointmentId) => {
    setLoadingAction(appointmentId);
    try {
      const res = await api.post(`/appointments/${appointmentId}/checkout`);
      window.location.href = res.data.url; // Redirect to Stripe
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initiate checkout');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setLoadingAction(appointmentId);
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: newStatus });
      fetchAppointments(userRole);
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setLoadingAction(null);
    }
  };

  if (approvalStatus === 'pending') {
    return (
      <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center p-6">
        <div className="lg:max-w-2xl w-full bg-white rounded-3xl p-8 text-center shadow-lg border border-outline-variant/30">
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">hourglass_empty</span>
          </div>
          <h2 className="text-headline-md font-headline-md text-on-surface mb-2">Approval Pending</h2>
          <p className="text-body-lg text-on-surface-variant mb-6">
            Your application is under review by administration.
          </p>
          <button onClick={logout} className="w-full py-3 bg-surface-variant text-on-surface-variant rounded-full hover:bg-outline-variant/30 transition-colors">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (approvalStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-lg border border-outline-variant/30">
          <div className="w-16 h-16 bg-error-container text-on-error-container rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">cancel</span>
          </div>
          <h2 className="text-headline-md font-headline-md text-on-surface mb-2">Application Rejected</h2>
          <button onClick={logout} className="w-full py-3 bg-surface-variant text-on-surface-variant rounded-full hover:bg-outline-variant/30 transition-colors">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-body-md text-body-md bg-background text-on-background flex h-screen overflow-hidden">
      {/* SideNavBar */}
      <nav className="h-screen w-64 fixed left-0 top-0 border-r border-white/20 shadow-[0px_20px_50px_rgba(11,95,165,0.1)] bg-white/75 dark:bg-surface/75 backdrop-blur-[40px] z-50 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link to="/">
            <h1 className="font-display-lg text-headline-md font-bold text-primary">MediBook Health</h1>
            <p className="font-label-md text-label-md text-on-surface-variant mt-1">Health Portal</p>
          </Link>
        </div>
        <div className="flex flex-col h-full py-8 space-y-4 flex-grow overflow-y-auto">
          <Link className="flex items-center gap-3 bg-primary text-on-primary rounded-full px-4 py-3 mx-2 font-label-md text-label-md shadow-4" to="/dashboard">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            Dashboard
          </Link>
          <Link className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-low rounded-full px-4 py-3 mx-2 transition-all font-label-md text-label-md" to="/dashboard">
            <span className="material-symbols-outlined">calendar_month</span>
            Appointments
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* TopAppBar */}
        <header className="full-width sticky top-0 z-40 bg-transparent flex justify-between items-center w-full px-gutter py-4 bg-surface/50 dark:bg-surface-dim/50 backdrop-blur-4">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary hidden md:block">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary bg-surface-container-high flex items-center justify-center cursor-pointer"
              >
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant">person</span>
                )}
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-md border py-2 z-50">
                  <div className="py-2">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low text-left cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">logout</span> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto px-5 md:px-10 py-8 space-y-8">
          <section>
            <h1 className="font-display-lg text-headline-lg font-bold text-on-surface">Welcome back, {user?.firstName || 'User'}!</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Here is your dashboard overview.</p>
          </section>

          {/* Profile Completion Prompt */}
          {userRole && userRole !== 'patient' && !isProfileCompleted ? (
            <section className="bg-primary-container text-on-primary-container rounded-2xl p-6 shadow-sm mb-6">
              <h3 className="font-headline-md font-bold mb-2">Complete your {userRole} profile</h3>
              <p className="mb-4">You are registered as a {userRole}. Please complete onboarding to start receiving appointments.</p>
              <Link to={`/onboarding/${userRole}`} className="bg-primary text-white px-6 py-2 rounded-full shadow-md">Complete Profile</Link>
            </section>
          ) : (
            <>
              {/* Stats & Revenue Section */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-10 p-8 flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    <span className="material-symbols-outlined text-[32px]">{userRole === 'patient' ? 'event_available' : 'account_balance_wallet'}</span>
                  </div>
                  {userRole === 'patient' ? (
                    <>
                      <h3 className="font-headline-lg text-on-surface mb-2">Ready to book?</h3>
                      <Link to="/find-doctors" className="bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-full cursor-pointer inline-block mt-4">
                        Find a Doctor
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="font-headline-lg text-on-surface mb-2">Total Revenue</h3>
                      <p className="text-display-md text-primary font-bold">${revenue}</p>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-6">
                  <div className="glass-card rounded-10 p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                      <span className="material-symbols-outlined">calendar_clock</span>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface-variant">Appointments</p>
                      <p className="font-headline-md text-on-surface">{appointments.length} Total</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Appointments List */}
              <section>
                <h2 className="font-headline-md text-on-surface mb-4">Your Appointments</h2>
                {appointments.length === 0 ? (
                  <div className="glass-card rounded-10 p-8 text-center text-on-surface-variant">
                    No appointments found.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {appointments.map(app => (
                      <div key={app._id} className="glass-card rounded-10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-primary">
                        <div>
                          <p className="font-label-lg font-bold text-on-surface">
                            {new Date(app.date).toLocaleDateString()} • {app.startTime} - {app.endTime}
                          </p>
                          <p className="text-on-surface-variant mt-1">
                            {userRole === 'patient' ? `Dr. ${app.doctorId?.name}` : `Patient: ${app.patientId?.firstName} ${app.patientId?.lastName}`}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-surface-container-high rounded-full uppercase tracking-wider">{app.status}</span>
                            <span className="text-xs px-2 py-1 bg-primary-container/20 text-primary rounded-full uppercase tracking-wider">{app.paymentStatus}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Patient Actions */}
                          {userRole === 'patient' && app.status === 'awaiting_payment' && app.paymentStatus === 'pending' && (
                            <button 
                              onClick={() => handleCheckout(app._id)}
                              disabled={loadingAction === app._id}
                              className="bg-[#4EF27A] text-[#002108] px-6 py-2 rounded-full shadow hover:shadow-lg transition-all cursor-pointer font-bold"
                            >
                              {loadingAction === app._id ? 'Processing...' : `Pay $${app.amount}`}
                            </button>
                          )}

                          {/* Doctor Actions */}
                          {(userRole === 'doctor' || userRole === 'clinic') && app.status === 'pending' && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleStatusUpdate(app._id, 'awaiting_payment')}
                                disabled={loadingAction === app._id}
                                className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition cursor-pointer"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(app._id, 'cancelled')}
                                disabled={loadingAction === app._id}
                                className="bg-error/10 text-error px-4 py-2 rounded-full hover:bg-error/20 transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
