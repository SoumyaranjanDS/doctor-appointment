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
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, total: 0 });
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

  // Check role logic
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
          } catch (err) {
            console.error('Failed to fetch user profile:', err);
            if (err.response?.status === 404) {
              // Webhook hasn't completed yet, fallback to JWT role
              backendRole = user?.role || 'patient';
              isCompleted = false;
              setUserRole(backendRole);
              setIsProfileCompleted(false);
            } else {
              return; // Stop execution on 500s
            }
          }

          if (backendRole === 'admin') {
            navigate('/admin/dashboard');
            return;
          }

          // Automatic redirect to onboarding if profile is incomplete
          if ((backendRole === 'doctor' || backendRole === 'clinic') && !isCompleted) {
            navigate(`/onboarding/${backendRole}`);
            return;
          }

          // Fetch dashboard stats
          try {
            const statsRes = await api.get('/dashboard/stats');
            setStats(statsRes.data);
          } catch (e) {
            console.error('Failed to fetch stats', e);
          }
        } catch (err) {
          console.error('Outer error:', err);
        }
    };

    fetchUserData();
  }, [navigate, user]);

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
          <Link className="flex items-center gap-3 bg-primary text-on-primary rounded-full px-4 py-3 mx-2 font-label-md text-label-md shadow-4 transform hover:scale-105 transition-all" to="/dashboard">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            Dashboard
          </Link>
          <Link className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-low rounded-full px-4 py-3 mx-2 hover:bg-primary-container/20 transition-all font-label-md text-label-md" to="/appointments">
            <span className="material-symbols-outlined">calendar_month</span>
            Appointments
          </Link>
          <Link className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-low rounded-full px-4 py-3 mx-2 hover:bg-primary-container/20 transition-all font-label-md text-label-md" to="/messages">
            <span className="material-symbols-outlined">chat</span>
            Messages
          </Link>
          <Link className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-low rounded-full px-4 py-3 mx-2 hover:bg-primary-container/20 transition-all font-label-md text-label-md" to="/records">
            <span className="material-symbols-outlined">folder_shared</span>
            Medical Records
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* TopAppBar */}
        <header className="full-width sticky top-0 z-40 bg-transparent flex justify-between items-center w-full px-gutter py-4 bg-surface/50 dark:bg-surface-dim/50 backdrop-blur-4">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-primary dark:text-inverse-primary hover:bg-surface-variant/50 rounded-full p-2 cursor-pointer">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary hidden md:block">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-2 w-64 border border-outline-variant focus-within:border-primary focus-within:shadow-[0_0_10px_rgba(0,71,127,0.2)] transition-all">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-body-md w-full text-on-surface" placeholder="Search..." type="text"/>
            </div>
            <button className="text-primary dark:text-inverse-primary hover:bg-surface-variant/50 rounded-full p-2 transition-all cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary cursor-pointer hover:opacity-80 transition-opacity focus:outline-none bg-surface-container-high flex items-center justify-center"
              >
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant">person</span>
                )}
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-outline-variant py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-outline-variant/30 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant">person</span>
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-label-md text-sm text-on-surface font-semibold truncate">{user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}</p>
                      <p className="font-caption text-xs text-on-surface-variant truncate mt-0.5">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        // Open profile settings...
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-[20px]">settings</span> Manage account
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors cursor-pointer text-left"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto px-5 md:px-10 py-8 space-y-section-gap">
          <section>
            <h1 className="font-display-lg text-headline-lg font-bold text-on-surface">Welcome back, {user?.firstName || 'User'}!</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Here is your health overview for today.</p>
          </section>

          {/* Profile Completion Prompt */}
          {userRole && userRole !== 'patient' && !isProfileCompleted ? (
            <section className="bg-primary-container text-on-primary-container rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-primary/20 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold">Complete your {userRole} profile to earn</h3>
                  <p className="font-body-md text-body-md mt-1 opacity-90">You are registered as a {userRole}. Please complete onboarding to start receiving appointments.</p>
                </div>
              </div>
              <Link to={`/onboarding/${userRole}`} className="bg-primary hover:bg-primary/90 text-white font-label-md px-6 py-3 rounded-full shadow-md transition-all whitespace-nowrap">
                Complete {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Profile
              </Link>
            </section>
          ) : (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Next Appointment Hero Card */}
              <div className="lg:col-span-2 glass-card rounded-10 p-8 relative overflow-hidden flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-[32px]">{userRole === 'patient' ? 'event_available' : 'event_note'}</span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2">You're all caught up!</h3>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">No upcoming appointments scheduled for today.</p>
                {userRole === 'patient' ? (
                  <button className="bg-primary text-white hover:bg-primary/90 transition-all shadow-md font-label-md text-label-md px-6 py-3 rounded-full cursor-pointer">
                    Book an Appointment
                  </button>
                ) : (
                  <button className="bg-primary text-white hover:bg-primary/90 transition-all shadow-md font-label-md text-label-md px-6 py-3 rounded-full cursor-pointer">
                    Manage Schedule
                  </button>
                )}
              </div>

              {/* Stats Cards Column */}
              <div className="flex flex-col gap-6">
                <div className="glass-card rounded-10 p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_clock</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">Upcoming</p>
                    <p className="font-headline-md text-headline-md text-on-surface">{stats.upcoming} Appointments</p>
                  </div>
                </div>
                <div className="glass-card rounded-10 p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">Completed</p>
                    <p className="font-headline-md text-headline-md text-on-surface">{stats.completed} Visits</p>
                  </div>
                </div>
                <div className="glass-card rounded-10 p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">Total History</p>
                    <p className="font-headline-md text-headline-md text-on-surface">{stats.total} Records</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
