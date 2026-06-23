import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const CustomAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [activeTab, setActiveTab] = useState('signin');
  
  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  
  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [role, setRole] = useState('patient');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
        email: signInEmail,
        password: signInPassword,
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', {
        email: signUpEmail,
        password: signUpPassword,
        firstName: signUpName.split(' ')[0],
        lastName: signUpName.split(' ').slice(1).join(' ') || '',
        role
      });
      login(res.data.token, res.data.user);
      if (role === 'doctor' || role === 'clinic') {
        navigate(`/onboarding/${role}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container h-screen w-full flex relative overflow-hidden">
      <Link to="/" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-primary font-label-md z-50 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white hover:bg-white transition-colors">
        <span className="material-symbols-outlined text-[18px]">home</span>
        Return Home
      </Link>
      
      {/* Background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="flex w-full h-full relative z-10">
        {/* Left Panel: Hero Content */}
        <section className="hidden md:flex w-1/2 flex-col justify-center px-16 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 -z-10"></div>
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-label-md mb-8">
              <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
              <span>Premium Healthcare Platform</span>
            </div>
            
            <h1 className="text-display-lg font-display-lg text-on-surface mb-6 leading-tight">
              Your health,<br />
              <span className="text-primary">simplified.</span>
            </h1>
            
            <p className="text-body-lg text-on-surface-variant mb-12">
              Connect with top medical professionals, manage your appointments, and take control of your healthcare journey in one seamless platform.
            </p>

            <div className="space-y-6">
              {[
                { icon: 'verified', title: 'Verified Professionals', desc: 'Access to certified top-tier doctors and clinics.' },
                { icon: 'calendar_clock', title: 'Instant Booking', desc: 'Schedule appointments seamlessly with real-time availability.' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-outline-variant/20 shrink-0">
                    <span className="material-symbols-outlined">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-label-md font-label-md text-on-surface mb-1">{feature.title}</h3>
                    <p className="text-body-md text-on-surface-variant">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel: Authentication Form */}
        {/* Removed overflow-y-auto to stop scrolling as requested */}
        <section className="w-full md:w-1/2 bg-white p-6 md:p-8 flex flex-col md:justify-center items-center relative h-full">
          
          <div className="w-full max-w-[420px]">
            {/* Custom Header */}
            <div className="mb-4 text-center">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3 text-white shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined filled text-[20px]">medical_services</span>
              </div>
              <h2 className="text-headline-sm font-headline-md text-on-surface mb-1">
                Welcome
              </h2>
              <p className="text-body-md text-on-surface-variant">
                Sign in to your account or create a new one.
              </p>
            </div>

            <div className="flex bg-surface-container-low p-1 rounded-xl mb-4 border border-outline-variant">
              <button 
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2 text-label-sm font-label-md rounded-lg transition-colors ${activeTab === 'signin' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 text-label-sm font-label-md rounded-lg transition-colors ${activeTab === 'signup' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-label-md text-center">
                {error}
              </div>
            )}

            {/* Sign In / Sign Up Forms */}
            <div className="relative">
              {activeTab === 'signin' ? (
                  <form onSubmit={handleSignIn} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div>
                      <label className="block text-label-md font-label-md text-on-surface mb-1">Email Address</label>
                      <input 
                        type="email" required
                        value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-label-md font-label-md text-on-surface mb-1">Password</label>
                      <div className="relative">
                        <input 
                          type={showSignInPassword ? 'text' : 'password'} required
                          value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-12"
                          placeholder="••••••••"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                          <span className="material-symbols-outlined">{showSignInPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>
                    <button 
                      type="submit" disabled={loading}
                      className="w-full py-2.5 bg-primary text-white rounded-full font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 mt-2 shadow-md shadow-primary/20"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div>
                      <label className="block text-label-sm font-label-md text-on-surface mb-1">I want to join as a</label>
                      <div className="flex gap-2 mb-2">
                        {['patient', 'doctor', 'clinic'].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`flex-1 py-1.5 px-2 text-label-sm font-label-md rounded-lg capitalize transition-colors border ${
                              role === r 
                                ? 'bg-primary-container text-on-primary-container border-primary' 
                                : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-variant/50'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-label-md font-label-md text-on-surface mb-1">Full Name</label>
                      <input 
                        type="text" required
                        value={signUpName} onChange={(e) => setSignUpName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-label-md font-label-md text-on-surface mb-1">Email Address</label>
                      <input 
                        type="email" required
                        value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-label-md font-label-md text-on-surface mb-1">Password</label>
                      <div className="relative">
                        <input 
                          type={showSignUpPassword ? 'text' : 'password'} required
                          value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-12"
                          placeholder="••••••••"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                          <span className="material-symbols-outlined">{showSignUpPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>
                    <button 
                      type="submit" disabled={loading}
                      className="w-full py-2.5 bg-primary text-white rounded-full font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 mt-2 shadow-md shadow-primary/20"
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                  </form>
                )}
              </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomAuth;
