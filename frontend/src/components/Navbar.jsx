import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { FiSearch, FiUser, FiChevronDown } from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (sectionId) => {
    if (location.pathname === '/') {
      scrollToSection(sectionId);
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.reload();
    navigate('/');
  };
  const handleSignUp = () => {
    navigate('/register');
  };

  const handleNavigateToSection = (sectionId) => {
    if (location.pathname === '/') {
      scrollToSection(sectionId);
    } else {
      navigate(`/?scrollTo=${sectionId}`);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/40 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center transform rotate-12">
            <span className="text-white font-bold text-lg -rotate-12">S</span>
          </div>
          <span className="text-xl font-display font-bold text-white tracking-wide">
            ServeEase
          </span>
        </Link>

        {/* Center Links (Desktop only) */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          {isAuthenticated && (location.pathname === '/dashboard' || location.pathname === '/admin-dashboard' || location.pathname === '/captain-dashboard') ? (
            <>
              {user?.role === 'user' && (
                <>
                  <p className="text-sm font-medium hover:text-indigo-400 transition-colors text-white">Welcome, {user.name}</p>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <p className="text-sm font-medium hover:text-indigo-400 transition-colors text-white">Welcome, {user.name}</p>
                </>
              )}
              {user?.role === 'captain' && (
                <>
                  <p className="text-sm font-medium hover:text-indigo-400 transition-colors text-white">Welcome, {user.name}</p>
                </>
              )}
            </>
          ) : (
            <>
              <button onClick={() => handleNavigateToSection('home')} className="hover:text-white transition-colors cursor-pointer">Home</button>
              <button onClick={() => handleNavigateToSection('services')} className="hover:text-white transition-colors cursor-pointer">Services</button>
              <button onClick={() => handleNavigateToSection('captains')} className="hover:text-white transition-colors cursor-pointer">For Captains</button>
              <button onClick={() => handleNavigateToSection('company')} className="hover:text-white transition-colors cursor-pointer">Company</button>
              <button onClick={() => handleNavigateToSection('pricing')} className="hover:text-white transition-colors cursor-pointer">Pricing</button>
              <button onClick={() => handleNavigateToSection('about')} className="hover:text-white transition-colors cursor-pointer">About</button>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex gap-4 items-center">

          {!isAuthenticated ? (
            <div className="flex gap-3 items-center">
              <Link to="/login" className="flex items-center gap-2 border border-white/10 rounded-full px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-white">
                <FiUser />
                <span>Login</span>
              </Link>
              <button onClick={handleSignUp} className="flex items-center gap-2 border border-white/10 rounded-full px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-white">
                <FiUser />
                Sign Up
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to={user.role === 'admin' ? '/admin-dashboard' : user.role === 'captain' ? '/captain-dashboard' : '/dashboard'} className="text-sm font-medium hover:text-indigo-400 transition-colors text-white">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors bg-red-400/10 px-3 py-1.5 rounded-full border border-red-500/20">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
