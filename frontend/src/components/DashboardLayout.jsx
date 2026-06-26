import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const DashboardLayout = ({ 
  user, 
  userRole, 
  sidebarItems = [], 
  activeTab, 
  onTabChange, 
  title = "Dashboard", 
  onLogout,
  children 
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-surface-container-lowest overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`fixed md:relative z-50 h-full w-64 glass-panel border-r border-white/40 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-6 py-6 border-b border-outline-variant/20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px] filled">health_and_safety</span>
            <span className="font-display-lg text-primary text-xl font-bold tracking-tight">CareConnect</span>
          </Link>
          <button className="md:hidden text-on-surface-variant" onClick={() => setIsSidebarOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-4 py-6 flex-1 overflow-y-auto space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-label-md transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-primary to-primary-container text-white shadow-md scale-[1.02]' 
                  : 'text-on-surface hover:bg-surface-container hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === item.id ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                {item.label}
              </div>
              {item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === item.id ? 'bg-white text-primary' : 'bg-error text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* User Mini Profile in Sidebar */}
        <div className="p-4 mt-auto border-t border-outline-variant/20">
          <div className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-3 border border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 overflow-hidden">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined">person</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label-md font-bold text-on-surface truncate">
                {userRole === 'patient' ? `${user?.firstName || ''} ${user?.lastName || ''}` : user?.name || user?.firstName || 'User'}
              </p>
              <p className="text-body-sm text-on-surface-variant capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        
        {/* Top Header */}
        <header className="h-20 px-6 lg:px-10 flex items-center justify-between glass-nav sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold hidden sm:block">{title}</h2>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <NotificationBell />
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 hover:bg-surface-container p-1 pr-3 rounded-full transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden border-2 border-primary-container shrink-0">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  )}
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-200" style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'none' }}>
                  expand_more
                </span>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 py-2 z-50 transform origin-top-right transition-all animate-fade-in">
                  <div className="px-4 py-3 border-b border-outline-variant/20 mb-2">
                    <p className="text-label-md font-bold text-on-surface truncate">
                      {userRole === 'patient' ? `${user?.firstName || ''} ${user?.lastName || ''}` : user?.name || user?.firstName || 'User'}
                    </p>
                    <p className="text-body-sm text-on-surface-variant truncate">{user?.primaryEmailAddress?.emailAddress || user?.email}</p>
                  </div>
                  
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-error/10 hover:text-error text-on-surface transition-colors cursor-pointer text-left font-label-md">
                    <span className="material-symbols-outlined text-[20px]">logout</span> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default DashboardLayout;
