import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../css/admin_style.css';

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                toast.error('Please login first');
                return;
            }

            console.log('Fetching orders...');
            const response = await axios.get('http://localhost:5000/api/admin/orders', {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Response:', response.data);

            if (response.data.success) {
                console.log('Orders:', response.data.orders);
                console.log('Total orders:', response.data.totalOrders);
                setOrders(response.data.orders);
                setTotalOrders(response.data.totalOrders);
            } else {
                console.error('Failed to fetch orders:', response.data);
                toast.error('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            console.error('Error details:', error.response?.data);
            toast.error(error.response?.data?.error || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            const response = await axios.put(`http://localhost:5000/api/admin/orders/${orderId}`, 
                { status: newStatus },
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                toast.success('Order status updated successfully');
                fetchOrders(); // Refresh orders list
            } else {
                toast.error('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error(error.response?.data?.error || 'Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-orders">
            <div className="header">
                <h1>Orders</h1>
                <div className="order-count">
                    {totalOrders} Orders
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading orders...</div>
            ) : (
                <div className="table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Products</th>
                                <th>Total Amount</th>
                                <th>Order Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.user_name}</td>
                                        <td>
                                            <ul className="order-products">
                                                {order.products.map((product, index) => (
                                                    <li key={index}>
                                                        {product.name} x {product.quantity}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td>Rs. {order.total_amount.toLocaleString()}</td>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select 
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                className="status-select"
                                                style={{
                                                    backgroundColor: order.status.toLowerCase() === 'delivered' ? '#d4edda' : 'white'
                                                }}
                                            >
                                                <option value="received">Received</option>
                                                <option value="dispatched">Dispatched</option>
                                                <option value="delivered">Delivered</option>
                                            </select>
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

export default AdminOrders;

