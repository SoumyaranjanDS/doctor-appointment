import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import ClinicDoctorsTab from '../components/ClinicDoctorsTab';
import PrescriptionMaker from '../components/PrescriptionMaker';
import PrescriptionViewer from '../components/PrescriptionViewer';
import ReviewMaker from '../components/ReviewMaker';
import EHRTab from '../components/EHRTab';
import NotificationBell from '../components/NotificationBell';
import ChatModal from '../components/ChatModal';
import { generateInvoice } from '../utils/generateInvoice';
import RevenueChart from '../components/RevenueChart';
import DashboardLayout from '../components/DashboardLayout';

const socket = io('/');

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isProfileCompleted, setIsProfileCompleted] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState('approved');
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, total: 0 });
  const [activeTab, setActiveTab] = useState('appointments');
  
  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [hideRevenue, setHideRevenue] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  
  // EHR state for patients
  const [patientRecords, setPatientRecords] = useState([]);
  const [ehrViewerAppt, setEhrViewerAppt] = useState(null);
  
  // Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  // Prescription & Review Modals State
  const [prescriptionMakerAppt, setPrescriptionMakerAppt] = useState(null);
  const [prescriptionViewerAppt, setPrescriptionViewerAppt] = useState(null);
  const [reviewMakerAppt, setReviewMakerAppt] = useState(null);
  const [chatModalAppt, setChatModalAppt] = useState(null);

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
          if (backendRole !== 'patient') {
            fetchStats();
          }
        }

      } catch (err) {
        console.error('Outer error:', err);
      }
    };

    fetchUserData();
  }, [navigate, user]);

  // Global socket connection for notifications
  useEffect(() => {
    if (user?.role === 'doctor') {
      socket.emit('register-user', user._id);

      socket.on('peer-joined-room', ({ roomId }) => {
        toast.success("The other person has joined the video consultation! Please join the room.", { duration: 5000 });
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
      if (res.data.hideRevenue !== undefined) {
        setHideRevenue(res.data.hideRevenue);
        setRevenue(res.data.totalRevenue || 0);
        setPendingRevenue(res.data.pendingRevenue || 0);
        setAvailableBalance(res.data.availableBalance || 0);
        setTotalWithdrawn(res.data.totalWithdrawn || 0);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchAppointments = async (role) => {
    try {
      if (role === 'patient') {
        const res = await api.get('/appointments/patient');
        setAppointments(res.data);
        
        // Also fetch medical records for patient
        const ehrRes = await api.get('/user/medical-records');
        setPatientRecords(ehrRes.data);
      } else if (role === 'doctor') {
        const res = await api.get('/appointments/doctor');
        setAppointments(res.data.appointments || []);
        
        if (res.data.hideRevenue !== undefined) {
          setHideRevenue(res.data.hideRevenue);
          setRevenue(res.data.totalRevenue || 0);
          setPendingRevenue(res.data.pendingRevenue || 0);
          setAvailableBalance(res.data.availableBalance || 0);
          setTotalWithdrawn(res.data.totalWithdrawn || 0);
        }
      } else if (role === 'clinic') {
        const res = await api.get('/appointments/clinic');
        setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      const formattedDetails = `
Account Holder: ${bankDetails.accountHolder}
Bank Name: ${bankDetails.bankName}
Account Number: ${bankDetails.accountNumber}
IFSC Code: ${bankDetails.ifscCode}
${bankDetails.upiId ? `UPI ID: ${bankDetails.upiId}` : ''}
      `.trim();

      toast.loading('Submitting withdrawal request...', { id: 'withdraw' });
      await api.post('/finance/withdraw', {
        amount: Number(withdrawAmount),
        paymentDetails: formattedDetails
      });
      toast.success('Withdrawal request submitted', { id: 'withdraw' });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setBankDetails({
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: ''
      });
      fetchStats();
      if (userRole === 'doctor' || userRole === 'clinic') fetchAppointments(userRole);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit withdrawal', { id: 'withdraw' });
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
      toast.success('Appointment status updated');
      fetchAppointments(userRole);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownloadReceipt = async (appointment) => {
    try {
      toast.loading('Generating receipt...', { id: 'receipt' });
      await generateInvoice(appointment, user);
      toast.success('Receipt downloaded successfully!', { id: 'receipt' });
    } catch (err) {
      toast.error('Failed to generate receipt.', { id: 'receipt' });
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

  // Prepare sidebar items based on role
  const sidebarItems = [
    { id: 'appointments', label: 'Appointments', icon: 'calendar_month' }
  ];
  if (userRole === 'clinic') {
    sidebarItems.push({ id: 'manage_doctors', label: 'Manage Doctors', icon: 'groups' });
  }
  if (userRole === 'patient') {
    sidebarItems.push({ id: 'medical_records', label: 'My Health Records', icon: 'folder_open' });
  }

  return (
    <>
    <DashboardLayout
      user={user}
      userRole={userRole}
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title="Dashboard"
      onLogout={logout}
    >
      <div className="space-y-8 animate-fade-in">
        <section className="bg-gradient-to-br from-primary/10 to-primary-container/20 p-8 rounded-3xl border border-primary/10 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="font-display-lg text-headline-lg font-bold text-primary">Welcome back, {user?.firstName || 'User'}!</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Here is your dashboard overview.</p>
          </div>
          <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[140px] text-primary/5 select-none pointer-events-none">
            {userRole === 'patient' ? 'health_and_safety' : 'medical_services'}
          </span>
        </section>

          {/* Profile Completion Prompt */}
          {userRole && userRole !== 'patient' && !isProfileCompleted ? (
            <section className="bg-primary-container text-on-primary-container rounded-2xl p-6 shadow-sm mb-6">
              <h3 className="font-headline-md font-bold mb-2">Complete your {userRole} profile</h3>
              <p className="mb-4">You are registered as a {userRole}. Please complete onboarding to start receiving appointments.</p>
              <Link to={`/onboarding/${userRole}`} className="bg-primary text-white px-6 py-2 rounded-full shadow-md">Complete Profile</Link>
            </section>
          ) : activeTab === 'manage_doctors' ? (
            <ClinicDoctorsTab clinicId={user?._id} />
          ) : activeTab === 'medical_records' ? (
            <EHRTab 
              records={patientRecords} 
              isPatient={true} 
              onRecordsUpdated={() => fetchAppointments('patient')} 
            />
          ) : (
            <>
              {/* Stats & Revenue Section */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden border border-white/50 shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 z-0"></div>
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-full flex items-center justify-center text-white mb-6 shadow-md">
                      <span className="material-symbols-outlined text-[32px]">{userRole === 'patient' ? 'event_available' : 'account_balance_wallet'}</span>
                    </div>
                    {userRole === 'patient' ? (
                      <>
                        <h3 className="font-display-lg text-3xl font-bold text-on-surface mb-2">Ready to book?</h3>
                        <Link to="/find-doctors" className="bg-primary text-white hover:bg-primary-container hover:text-on-primary-container px-8 py-3 rounded-full shadow-md font-label-lg transition-all mt-4 transform hover:scale-105 inline-flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">search</span> Find a Doctor
                        </Link>
                      </>
                    ) : hideRevenue ? (
                      <>
                        <h3 className="font-display-lg text-2xl font-bold text-on-surface mb-2">Clinic Doctor</h3>
                        <p className="text-body-lg text-on-surface-variant">Your financial details are managed by your clinic.</p>
                      </>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-outline-variant/20 w-full text-left">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                            <div>
                              <h3 className="font-label-lg text-on-surface-variant mb-1 uppercase tracking-wider">Total Revenue</h3>
                              <p className="text-display-md text-primary font-bold">₹{revenue.toLocaleString()}</p>
                            </div>
                            <div className="mt-4 md:mt-0 text-left md:text-right">
                              <h3 className="font-label-lg text-on-surface-variant mb-1 uppercase tracking-wider">Pending Amount</h3>
                              <p className="text-display-md text-on-surface font-bold">₹{pendingRevenue.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="border-t border-outline-variant/30 pt-6 flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest/50 -mx-8 -mb-8 p-8 rounded-b-3xl">
                            <div className="flex gap-8">
                              <div>
                                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Available</p>
                                <p className="font-bold text-on-surface text-xl">₹{availableBalance.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Withdrawn</p>
                                <p className="font-bold text-on-surface text-xl">₹{totalWithdrawn.toLocaleString()}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setShowWithdrawModal(true)}
                              disabled={availableBalance < 100}
                              className={`mt-6 md:mt-0 px-8 py-3 rounded-full font-label-md transition-all flex items-center gap-2 ${
                                availableBalance < 100 ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed' : 'bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container hover:shadow-lg transform hover:-translate-y-0.5'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]">payments</span> Withdraw
                            </button>
                          </div>
                        </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="glass-panel rounded-3xl p-8 flex items-center gap-6 border border-white/50 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 rounded-bl-full -mr-4 -mt-4"></div>
                    <div className="w-14 h-14 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center shadow-md relative z-10">
                      <span className="material-symbols-outlined text-[28px]">calendar_clock</span>
                    </div>
                    <div className="relative z-10">
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Upcoming</p>
                      <p className="text-display-md text-on-surface font-bold leading-none">{appointments.length}</p>
                    </div>
                  </div>
                  <div className="glass-panel p-8 rounded-3xl border border-white/50 shadow-sm flex-1 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/10 rounded-tl-full -mr-8 -mb-8"></div>
                    <div className="relative z-10">
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Total Historic</p>
                      <h2 className="text-[56px] font-bold text-on-surface leading-none tracking-tight">{stats.total}</h2>
                    </div>
                  </div>
                </div>
              </section>

              {(user?.role === 'doctor' || user?.role === 'clinic') && stats.revenueData && stats.revenueData.length > 0 && (
                <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <RevenueChart data={stats.revenueData} title="Revenue (Last 7 Days)" />
                </div>
              )}

              {/* Appointments List */}
              <section className="mt-4">
                <h2 className="font-display-sm text-2xl text-on-surface font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">event</span>
                  Your Appointments
                </h2>
                {appointments.length === 0 ? (
                  <div className="glass-panel rounded-3xl p-12 text-center border border-white/50 flex flex-col items-center">
                    <div className="w-20 h-20 bg-surface-variant text-on-surface-variant rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[40px]">event_busy</span>
                    </div>
                    <h3 className="font-headline-sm text-on-surface font-bold mb-2">No appointments scheduled</h3>
                    <p className="text-body-lg text-on-surface-variant">You're all caught up for now.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {appointments.map(app => (
                      <div key={app._id} className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-primary border border-white/50 hover:shadow-md transition-shadow">
                        <div className="flex gap-4 items-start">
                          <div className="hidden sm:flex w-12 h-12 bg-primary/10 text-primary rounded-xl items-center justify-center font-bold text-lg">
                            {new Date(app.date).getDate()}
                          </div>
                          <div>
                            <p className="font-label-lg font-bold text-on-surface flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-on-surface-variant sm:hidden">calendar_today</span>
                              {new Date(app.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                              <span className="text-outline-variant">•</span>
                              <span className="text-primary">{app.startTime} - {app.endTime}</span>
                            </p>
                            <p className="text-body-lg text-on-surface-variant mt-1 font-medium">
                              {userRole === 'patient' ? `Dr. ${app.doctorId?.name}` : `Patient: ${app.patientId?.firstName} ${app.patientId?.lastName}`}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold ${
                                app.status === 'completed' ? 'bg-green-100 text-green-800' :
                                app.status === 'cancelled' ? 'bg-error-container text-on-error-container' :
                                'bg-surface-variant text-on-surface-variant'
                              }`}>
                                {app.status.replace('_', ' ')}
                              </span>
                              <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold ${
                                app.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                app.paymentStatus === 'paid_at_clinic' ? 'bg-blue-100 text-blue-800' :
                                'bg-error/10 text-error'
                              }`}>
                                {app.paymentStatus.replace('_', ' ')}
                              </span>
                            </div>
                            
                            {app.reasonForVisit && app.reasonForVisit !== 'General Consultation' && (
                              <div className="mt-3 bg-surface-variant/30 px-4 py-3 rounded-xl border border-outline-variant/20 flex items-start gap-3">
                                <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">info</span>
                                <div>
                                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Reason for Visit</p>
                                  <p className="text-sm text-on-surface leading-tight font-medium">"{app.reasonForVisit}"</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/20">
                          {/* Patient Checkout */}
                          {userRole === 'patient' && app.status === 'awaiting_payment' && app.paymentStatus === 'pending' && (
                            <button 
                              onClick={() => handleCheckout(app._id)}
                              disabled={loadingAction === app._id}
                              className="w-full md:w-auto bg-[#4EF27A] text-[#002108] px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer font-bold flex justify-center items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[20px]">credit_card</span>
                              {loadingAction === app._id ? 'Processing...' : `Pay ₹${app.amount}`}
                            </button>
                          )}

                          {/* Patient Video Room */}
                          {userRole === 'patient' && (app.paymentStatus === 'paid' || app.paymentStatus === 'paid_at_clinic') && app.status !== 'completed' && app.status !== 'cancelled' && (
                            <Link to={`/video-call/${app._id}`} className="w-full md:w-auto bg-primary text-white px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer font-bold flex justify-center items-center gap-2">
                              <span className="material-symbols-outlined text-[20px]">videocam</span> Join Call
                            </Link>
                          )}

                          {/* Doctor Write Prescription / Start Call */}
                          {(userRole === 'doctor' || userRole === 'clinic') && app.status !== 'completed' && app.status !== 'cancelled' && (
                            <div className="flex flex-col sm:flex-row w-full gap-2">
                              {app.appointmentType === 'video' && (app.paymentStatus === 'paid' || app.paymentStatus === 'paid_at_clinic') && (
                                <Link to={`/video-call/${app._id}`} className="flex-1 bg-secondary text-on-secondary px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer font-bold flex justify-center items-center gap-2">
                                  <span className="material-symbols-outlined text-[20px]">videocam</span> Join Call
                                </Link>
                              )}
                              <button 
                                onClick={() => setPrescriptionMakerAppt(app)}
                                className="flex-1 bg-primary text-white px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer font-bold flex justify-center items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[20px]">edit_document</span> Write Prescription
                              </button>
                            </div>
                          )}

                          {/* Patient Write Review */}
                          {userRole === 'patient' && app.status === 'completed' && !app.review && (
                             <button 
                               onClick={() => setReviewMakerAppt(app)}
                               className="w-full md:w-auto bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer font-bold flex justify-center items-center gap-2 border border-outline-variant/30"
                             >
                               <span className="material-symbols-outlined text-[20px] text-amber-500">star</span> Rate & Review
                             </button>
                          )}

                          {/* View EHR Data */}
                          {(userRole === 'doctor' || userRole === 'clinic') && app.patientId?.hasEhrData && (
                             <button 
                               onClick={() => setEhrViewerAppt(app)}
                               className="w-full md:w-auto bg-surface-container-high text-on-surface hover:bg-surface-container-highest px-6 py-2.5 rounded-full shadow-sm transition-all cursor-pointer font-bold flex justify-center items-center gap-2 border border-outline-variant/30"
                             >
                               <span className="material-symbols-outlined text-[20px]">folder_shared</span> View Records
                             </button>
                          )}

                          {/* Actions menu (Chat, Prescription) */}
                          <div className="flex gap-2 w-full md:w-auto justify-end">
                            <button 
                              onClick={() => setChatModalAppt(app)}
                              className="w-10 h-10 bg-surface text-primary rounded-full shadow-sm hover:shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center border border-outline-variant/20"
                              title="Chat"
                            >
                              <span className="material-symbols-outlined text-[20px]">chat</span>
                            </button>
                            {app.prescription && (
                              <button 
                                onClick={() => setPrescriptionViewerAppt(app)}
                                className="w-10 h-10 bg-surface text-primary rounded-full shadow-sm hover:shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center border border-outline-variant/20"
                                title="View Prescription"
                              >
                                <span className="material-symbols-outlined text-[20px]">description</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </DashboardLayout>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-2xl">
            <h3 className="text-headline-sm font-bold mb-2">Withdraw Funds</h3>
            <p className="text-body-md text-on-surface-variant mb-6">Available Balance: ₹{availableBalance}</p>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  required 
                  min="100"
                  max={availableBalance}
                  value={withdrawAmount} 
                  onChange={(e) => setWithdrawAmount(e.target.value)} 
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" 
                  placeholder="Min ₹100" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Account Holder Name</label>
                  <input 
                    type="text" 
                    required 
                    value={bankDetails.accountHolder} 
                    onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})} 
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Bank Name</label>
                  <input 
                    type="text" 
                    required 
                    value={bankDetails.bankName} 
                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})} 
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Account Number</label>
                  <input 
                    type="text" 
                    required 
                    value={bankDetails.accountNumber} 
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})} 
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">IFSC Code</label>
                  <input 
                    type="text" 
                    required 
                    value={bankDetails.ifscCode} 
                    onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})} 
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none uppercase" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-1">UPI ID (Optional)</label>
                  <input 
                    type="text" 
                    value={bankDetails.upiId} 
                    onChange={(e) => setBankDetails({...bankDetails, upiId: e.target.value})} 
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-primary outline-none" 
                    placeholder="example@upi"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8 pt-4">
                <button type="button" onClick={() => setShowWithdrawModal(false)} className="px-6 py-2 rounded-full border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-full bg-primary text-white font-bold hover:bg-primary/90">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor EHR Viewer Modal */}
      {ehrViewerAppt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/30 bg-surface-container-lowest">
              <h2 className="text-title-lg font-bold text-on-surface">Patient Health Records</h2>
              <button onClick={() => setEhrViewerAppt(null)} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-surface">
              <EHRTab 
                records={ehrViewerAppt.patientId.medicalRecords} 
                isPatient={false} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modals */}
      {prescriptionMakerAppt && (
        <PrescriptionMaker 
          appointment={prescriptionMakerAppt} 
          onClose={() => setPrescriptionMakerAppt(null)} 
          onSuccess={() => {
            setPrescriptionMakerAppt(null);
            fetchAppointments(userRole);
          }} 
        />
      )}

      {prescriptionViewerAppt && (
        <PrescriptionViewer 
          appointment={prescriptionViewerAppt} 
          onClose={() => setPrescriptionViewerAppt(null)} 
        />
      )}

      {reviewMakerAppt && (
        <ReviewMaker 
          appointment={reviewMakerAppt} 
          onClose={() => setReviewMakerAppt(null)} 
          onSuccess={() => {
            setReviewMakerAppt(null);
            fetchAppointments(userRole);
          }} 
        />
      )}

      {chatModalAppt && (
        <ChatModal 
          appointment={chatModalAppt} 
          onClose={() => setChatModalAppt(null)} 
        />
      )}
    </>
  );
};

export default Dashboard;
