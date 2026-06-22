import React from 'react';
import { Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

const Dashboard = () => {
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
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto px-5 md:px-10 py-8 space-y-section-gap">
          <section>
            <h1 className="font-display-lg text-headline-lg font-bold text-on-surface">Welcome back, Sarah!</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Here is your health overview for today.</p>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Next Appointment Hero Card */}
            <div className="lg:col-span-2 glass-card rounded-10 p-8 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1 rounded-full uppercase tracking-wider">Confirmed</span>
                  <span className="text-on-surface-variant font-label-md text-label-md">Upcoming Today</span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2">Dr. Emily Chen</h3>
                <p className="font-body-lg text-body-lg text-primary mb-6">Cardiology Consultation</p>
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                    <span className="font-body-md text-body-md">2:30 PM - 3:15 PM</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    <span className="font-body-md text-body-md">Room 402, North Wing</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="bg-[#4EF27A] text-[#002108] hover:bg-secondary-fixed transition-all shadow-[0_4px_14px_rgba(78,242,122,0.3)] hover:shadow-[0_6px_20px_rgba(78,242,122,0.4)] font-label-md text-label-md px-6 py-3 rounded-full cursor-pointer">
                  Check In
                </button>
                <button className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all font-label-md text-label-md px-6 py-3 rounded-full border border-outline-variant cursor-pointer">
                  Reschedule
                </button>
              </div>
            </div>

            {/* Stats Cards Column */}
            <div className="flex flex-col gap-6">
              <div className="glass-card rounded-10 p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_clock</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant">Upcoming</p>
                  <p className="font-headline-md text-headline-md text-on-surface">3 Appointments</p>
                </div>
              </div>
              <div className="glass-card rounded-10 p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant">Completed</p>
                  <p className="font-headline-md text-headline-md text-on-surface">12 Visits</p>
                </div>
              </div>
              <div className="glass-card rounded-10 p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant">New Records</p>
                  <p className="font-headline-md text-headline-md text-on-surface">2 Lab Results</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
