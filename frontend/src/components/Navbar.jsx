import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="glass sticky top-4 z-50 mx-4 md:mx-8 px-6 py-4 flex justify-between items-center mb-12">
      <Link to="/" className="text-2xl font-display font-bold text-gradient">
        ServeEase
      </Link>
      
      <div className="flex gap-6 items-center">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="text-sm font-medium hover:text-indigo-400 transition-colors">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <span className="text-sm font-medium opacity-80 hidden md:inline">
              Welcome, <span className="font-bold text-indigo-400">{user?.name}</span>
            </span>
            <Link to={user.role === 'admin' ? '/admin-dashboard' : user.role === 'captain' ? '/captain-dashboard' : '/dashboard'} className="text-sm font-medium hover:text-indigo-400 transition-colors">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors bg-red-400/10 px-4 py-2 rounded-xl">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
