import React, { useState, useEffect } from 'react';
import '../../css/admin_style.css'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Store token
        localStorage.setItem('adminToken', data.token);
        
        // Show success message
        toast.success('Login successful!');
        
        // Navigate to dashboard
        navigate('/admin/dashboard');
      } else {
        // Show error message
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Server error during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-container">
      <form onSubmit={handleSubmit}>
        <h3>Admin Login</h3>

        <input
          type="text"
          name="username"
          required
          placeholder="Enter your username"
          maxLength="50"
          className="box"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          name="password"
          required
          placeholder="Enter your password"
          maxLength="50"
          className="box"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button 
          type="submit" 
          className="btn"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login Now'}
        </button>
      </form>
    </section>
  );
}

export default AdminLogin;

