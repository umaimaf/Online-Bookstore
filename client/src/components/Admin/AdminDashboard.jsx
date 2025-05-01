import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/admin_style.css'; // Admin specific CSS

function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <section className="dashboard">
      <h1 className="title">Admin Dashboard</h1>

      <div className="box-container">
        <div className="box">
          <h3>Products</h3>
          <p>Manage your products</p>
          <Link to="/admin/products" className="btn">View Products</Link>
        </div>

        <div className="box">
          <h3>Orders</h3>
          <p>Manage customer orders</p>
          <Link to="/admin/orders" className="btn">View Orders</Link>
        </div>

        <div className="box">
          <h3>Users</h3>
          <p>View registered users</p>
          <Link to="/admin/users" className="btn">View Users</Link>
        </div>

        <div className="box">
          <h3>Messages</h3>
          <p>Check customer messages</p>
          <Link to="/admin/messages" className="btn">View Messages</Link>
        </div>

        <div className="box">
          <h3>Reviews</h3>
          <p>View product reviews</p>
          <Link to="/admin/reviews" className="btn">View Reviews</Link>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={handleLogout} className="delete-btn">
          Logout
        </button>
      </div>
    </section>
  );
}

export default AdminDashboard;

