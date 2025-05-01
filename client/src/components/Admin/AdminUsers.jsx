import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../css/admin_style.css';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                toast.error('Please login first');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setUsers(response.data.users);
            } else {
                toast.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error(error.response?.data?.error || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            const response = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.success('User deleted successfully');
                fetchUsers(); // Refresh the list
            } else {
                toast.error('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.error || 'Failed to delete user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-users">
            <div className="header">
                <h1>Users</h1>
                <div className="user-count">
                    {users.length} Users
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading users...</div>
            ) : (
                <div className="table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Username</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id}>
                                        <td>#{user.id}</td>
                                        <td>{user.username}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="delete-btn"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;
