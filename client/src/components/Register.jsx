import React, { useState } from 'react';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setMsg("Passwords do not match.");
      return;
    }

    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      setMsg(data.message);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setMsg(data.error);
    }
  };

  return (
    <section className="form-container">
      <form onSubmit={handleRegister}>
        <h3>Register</h3>

        <input
          type="text"
          placeholder="Enter username"
          className="box"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter password"
          className="box"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Re-enter password"
          className="box"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn">Register</button>
        <p>{msg}</p>
      </form>
    </section>
  );
}

export default Register;


