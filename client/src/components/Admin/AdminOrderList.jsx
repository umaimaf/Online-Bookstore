import React, { useEffect, useState } from 'react';
import '../../css/admin_style.css';
import { useNavigate } from 'react-router-dom';

function AdminOrderList() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const res = await fetch('http://localhost:5000/api/admin/orders');
    const data = await res.json();
    setOrders(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    await fetch(`http://localhost:5000/api/admin/orders/${id}`, { method: 'DELETE' });
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <section className="show-products">
      <h1 className="title">Customer Orders</h1>
      <div className="box-container">
        {orders.length === 0 ? (
          <p className="empty">No orders found.</p>
        ) : (
          orders.map(order => (
            <div className="box" key={order.id}>
              <h3 className="name">{order.name}</h3>
              <p><strong>Total:</strong> Rs. {order.total_price}</p>
              <p><strong>Status:</strong> {order.order_status}</p>
              <button className="option-btn" onClick={() => navigate(`/admin/orders/${order.id}`)}>View Details</button>
              <button className="delete-btn" onClick={() => handleDelete(order.id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default AdminOrderList;
