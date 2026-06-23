import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-surface-container-lowest fixed top-0 w-full z-50 border-b border-outline-variant flat no shadows">
      <div className="flex justify-between items-center h-16 max-w-[1280px] mx-auto px-4 md:px-12">
        <Link to="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary filled text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          <span className="font-headline-md text-headline-md text-primary">Medicare Connect</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link className="text-primary border-b-2 border-primary pb-1 font-label-md text-label-md cursor-pointer transition-all duration-200 active:scale-95" to="/find-doctors">Find Doctors</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md px-2 py-1 cursor-pointer" to="#">Clinics</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md px-2 py-1 cursor-pointer" to="#">Specialities</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md px-2 py-1 cursor-pointer" to="#">How It Works</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md px-2 py-1 cursor-pointer" to="#">For Doctors</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-on-surface hover:text-primary transition-colors font-label-md">Dashboard</Link>
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={logout}>
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-primary" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  </div>
                )}
                <span className="text-on-surface font-label-md text-sm hidden lg:block">Sign out</span>
              </div>
            </div>
          ) : (
            <>
              <Link to="/auth" className="text-on-surface hover:text-primary transition-colors font-label-md">Login</Link>
              <Link to="/auth" className="bg-primary text-white hover:bg-primary-container hover:text-on-primary-container px-5 py-2.5 rounded-full transition-colors font-label-md">
                Create Account
              </Link>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-4">
          {isAuthenticated && (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white cursor-pointer" onClick={logout}>
               <span className="material-symbols-outlined text-[18px]">logout</span>
            </div>
          )}
          <button 
            className="text-primary p-2 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant px-4 py-4 space-y-4 shadow-6 absolute w-full left-0">
          <Link className="block text-primary font-label-md text-label-md py-2 border-b border-outline-variant/30" to="/find-doctors" onClick={() => setIsMobileMenuOpen(false)}>Find Doctors</Link>
          <Link className="block text-on-surface-variant font-label-md text-label-md py-2 border-b border-outline-variant/30" to="#" onClick={() => setIsMobileMenuOpen(false)}>Clinics</Link>
          <Link className="block text-on-surface-variant font-label-md text-label-md py-2 border-b border-outline-variant/30" to="#" onClick={() => setIsMobileMenuOpen(false)}>Specialities</Link>
          <Link className="block text-on-surface-variant font-label-md text-label-md py-2 border-b border-outline-variant/30" to="#" onClick={() => setIsMobileMenuOpen(false)}>How It Works</Link>
          
          {!isAuthenticated ? (
            <>
              <Link to="/auth" className="block w-full text-left text-on-surface-variant font-label-md text-label-md py-2 border-b border-outline-variant/30" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/auth" className="block w-full mt-4 bg-primary text-white hover:bg-primary-container hover:text-on-primary-container px-4 py-3 rounded-full text-center font-label-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Create Account
              </Link>
            </>
          ) : (
            <Link className="block text-on-surface-variant font-label-md text-label-md py-2" to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
