import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md px-2 py-1 cursor-pointer">Login</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-primary-container text-white font-label-md text-label-md px-6 py-2 rounded-full hover:bg-primary transition-colors cursor-pointer active:scale-95">
                Book Appointment
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md px-2 py-1 cursor-pointer">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <div className="flex md:hidden items-center gap-4">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
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
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="block w-full text-left text-on-surface-variant font-label-md text-label-md py-2 border-b border-outline-variant/30" onClick={() => setIsMobileMenuOpen(false)}>Login</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="block w-full mt-4 bg-primary-container text-white font-label-md text-label-md px-4 py-3 rounded-full text-center" onClick={() => setIsMobileMenuOpen(false)}>
                Book Appointment
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link className="block text-on-surface-variant font-label-md text-label-md py-2" to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
          </SignedIn>
        </div>
      )}
    </header>
  );
};

export default Navbar;
