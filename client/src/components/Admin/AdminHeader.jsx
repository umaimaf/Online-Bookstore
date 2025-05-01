import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../css/admin_style.css';

function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutOptions, setShowLogoutOptions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = (goToStore = false) => {
    localStorage.removeItem('adminToken');
    if (goToStore) {
      navigate('/');
    } else {
      navigate('/admin/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="flex">
        {/* Left - Logo */}
        <Link to="/admin/dashboard" className="logo">
          Book<span>Heaven</span>
        </Link>

        {/* Center - Navigation */}
        <nav className={`navbar ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/admin/products" className={isActive('/admin/products') ? 'active' : ''}>
            Products
          </Link>
          <Link to="/admin/orders" className={isActive('/admin/orders') ? 'active' : ''}>
            Orders
          </Link>
          <Link to="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>
            Users
          </Link>
          <Link to="/admin/messages" className={isActive('/admin/messages') ? 'active' : ''}>
            Messages
          </Link>
          <Link to="/admin/reviews" className={isActive('/admin/reviews') ? 'active' : ''}>
            Reviews
          </Link>
        </nav>

        {/* Right - Menu & Logout */}
        <div className="icons">
          <div id="menu-btn" className="fas fa-bars" onClick={() => setIsMenuOpen(!isMenuOpen)}></div>
          <div 
            className="fas fa-sign-out-alt" 
            onClick={() => setShowLogoutOptions(!showLogoutOptions)}
            style={{ cursor: 'pointer' }}
          ></div>
          {showLogoutOptions && (
            <div className="account-box" style={{ right: '2rem' }}>
              <button 
                onClick={() => handleLogout(true)} 
                className="option-btn"
                style={{ width: '100%', marginBottom: '0.5rem' }}
              >
                Back to Store
              </button>
              <button 
                onClick={() => handleLogout(false)} 
                className="delete-btn"
                style={{ width: '100%' }}
              >
                Admin Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
