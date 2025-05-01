import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/style.css'; // tumhara normal style.css

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // yeh tumhara normal login logic hai
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('userId', data.id);
        console.log("🔐 Saved userId to localStorage:", data.id);
        setMessage('✅ Login successful!');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setMessage('❌ ' + (data.error || 'Login failed'));
      }
    } catch (err) {
      setMessage('❌ Server error during login');
    }
  };

 const handleAdminLoginRedirect = () => {
    navigate('/admin/login'); // 🛡️ Admin Login page par jaayega
  };

  return (
    <section className="form-container">
      <form onSubmit={handleLogin}>
        <h3>Login Now</h3>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            <span>{message}</span>
            <i className="fas fa-times" onClick={() => setMessage('')}></i>
          </div>
        )}

        <input
          type="text"
          name="username"
          required
          placeholder="Enter username"
          maxLength="50"
          className="box"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          name="password"
          required
          placeholder="Enter password"
          maxLength="50"
          className="box"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="btn">Login</button>

        <p>Don't have an account?</p>
          <Link to="/register" className="option-btn">Register Now</Link>

        <p>Are you an admin?</p>
        <button type="button" onClick={handleAdminLoginRedirect} className="option-btn">Admin Login</button>
        </form>
    </section>
  );
}

export default Login;
