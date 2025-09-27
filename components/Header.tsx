
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './icons/Logo';
import ThemeToggle from './ThemeToggle';
import Spinner from './Spinner';

// --- Reusable Confirmation Modal Component ---
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isConfirming?: boolean;
}> = ({ isOpen, onClose, onConfirm, title, message, isConfirming = false }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isConfirming) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isConfirming]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease-out forwards' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={() => !isConfirming && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
        style={{ animation: 'scaleIn 0.2s ease-out forwards' }}
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
            <svg className="h-6 w-6 text-red-600 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h2 id="modal-title" className="text-lg leading-6 font-bold text-dark dark:text-light">{title}</h2>
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary hover:bg-red-700 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {isConfirming && <Spinner className="w-5 h-5 mr-2" />}
            {isConfirming ? 'Logging out...' : 'Logout'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes scaleIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};


const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pfpError, setPfpError] = useState(false);
  const [mobilePfpError, setMobilePfpError] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setPfpError(false);
    setMobilePfpError(false);
  }, [user?.profilePicture]);

  const userInitials = user?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed to sync with the server:", error);
      // The user is still logged out on the client, so we can proceed with redirection.
    }
    // Redirect to home page after client-side session is cleared.
    window.location.hash = '#/';
  };


  const UserAvatar = ({ isMobile = false }) => {
    const hasError = isMobile ? mobilePfpError : pfpError;
    const setError = isMobile ? setMobilePfpError : setPfpError;
  
    if (hasError || !user?.profilePicture) {
      return (
        <div role="img" aria-label={`${user?.name}'s profile picture`} className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary transition-all duration-300">
          {userInitials}
        </div>
      );
    }
    
    return (
      <img
        src={user.profilePicture}
        alt={`${user.name}'s profile picture`}
        className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary transition-all duration-300"
        onError={() => setError(true)}
      />
    );
  };
  

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg shadow-sm dark:shadow-black/20 text-dark dark:text-light transition-colors duration-300 border-b border-gray-200/80 dark:border-gray-800/80">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <a href="#/" className="flex items-center space-x-3 text-xl font-bold transition-transform hover:scale-105">
              <Logo className="h-9 w-9 text-primary" />
              <span className="hidden sm:inline font-bold text-lg">Yay Mon Digital</span>
            </a>
            
            <nav className="hidden md:flex items-center space-x-8 font-semibold text-gray-600 dark:text-gray-300">
              <a href="#/" className="hover:text-primary transition-colors duration-300">Home</a>
              <a href="#/courses" className="hover:text-primary transition-colors duration-300">Courses</a>
              {user && <a href="#/dashboard" className="hover:text-primary transition-colors duration-300">Dashboard</a>}
            </nav>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <ThemeToggle />
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <>
                    <a href="#/profile" className="flex items-center space-x-3 group">
                      <UserAvatar />
                      <span className="hidden lg:inline font-bold group-hover:text-primary transition-colors">{user.name}</span>
                    </a>
                    <button onClick={handleLogoutClick} className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary/20 transition-all duration-300 transform hover:scale-105">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <a href="#/login" className="font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-300">Login</a>
                    <a href="#/register" className="bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                      Register
                    </a>
                  </>
                )}
              </div>
              <div className="md:hidden">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label="Toggle mobile menu"
                  >
                  <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
              </div>
            </div>
          </div>
          
          {isMenuOpen && (
            <div id="mobile-menu" className="md:hidden pb-4 px-2 space-y-3">
              <a href="#/" className="block py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold" onClick={() => setIsMenuOpen(false)}>Home</a>
              <a href="#/courses" className="block py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold" onClick={() => setIsMenuOpen(false)}>Courses</a>
              {user && <a href="#/dashboard" className="block py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold" onClick={() => setIsMenuOpen(false)}>Dashboard</a>}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                {user ? (
                    <>
                      <a href="#/profile" className="flex items-center space-x-3 group p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
                        <UserAvatar isMobile={true} />
                        <span className="font-bold group-hover:text-primary">{user.name}</span>
                      </a>
                      <button onClick={() => { handleLogoutClick(); setIsMenuOpen(false); }} className="w-full text-left bg-primary/10 text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary/20">
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <a href="#/login" className="flex-1 text-center font-semibold py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Login</a>
                      <a href="#/register" className="flex-1 block bg-primary text-white text-center px-5 py-2 rounded-lg font-semibold hover:bg-red-700" onClick={() => setIsMenuOpen(false)}>
                        Register
                      </a>
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <ConfirmationModal 
        isOpen={isLogoutModalOpen}
        onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        isConfirming={isLoggingOut}
      />
    </>
  );
};

export default Header;
