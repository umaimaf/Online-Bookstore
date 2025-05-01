import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/style.css';

function Header() {
  const [search, setSearch] = useState('');
  const [showUserBox, setShowUserBox] = useState(false);
  const user = localStorage.getItem("userId");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="header">
      <div className="header-2">
        <div className="flex">

          <Link to="/" className="logo">Book Heaven</Link>

          <nav className="navbar">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/contact">Contact</Link>
            {user && (
              <>
                <Link to="/myorders">My Orders</Link>
                <Link to="/mymessages">Messages</Link>
              </>
            )}
          </nav>

          <div className="right-icons">
            {/* Search box only on /shop */}
            {location.pathname === "/shop" && (
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            )}

            {/* Cart icon */}
            <Link to="/cart">
              <i className="fas fa-shopping-cart icon-btn"></i>
            </Link>

            {/* User icon */}
            <i className="fas fa-user icon-btn" onClick={() => setShowUserBox(!showUserBox)}></i>

            {showUserBox && (
              <div className="user-box active">
                {user ? (
                  <>
                    <p>Welcome, User</p>
                    <button className="delete-btn" onClick={() => {
                      localStorage.removeItem("userId");
                      window.location.href = "/";
                    }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="option-btn">Login</Link>
                    <Link to="/register" className="option-btn">Register</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;








