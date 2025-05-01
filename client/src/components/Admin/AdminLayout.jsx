import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';

function AdminLayout({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
    }
  }, [navigate]);

  return (
    <div className="admin-layout">
      <AdminHeader />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout; 