import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../css/admin_style.css';

function AdminOrderDetails() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  const fetchOrderItems = async () => {
    const res = await fetch(`http://localhost:5000/api/admin/orders/${id}/items`);
    const data = await res.json();
    setItems(data);
  };

  const updateStatus = async () => {
    const res = await fetch(`http://localhost:5000/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    setMessage(data.message);
  };

  useEffect(() => {
    fetchOrderItems();
  }, []);

  return (
    <section className="add-products">
      <h3>Order #{id} Details</h3>
      <ul style={{ marginBottom: '1rem' }}>
        {items.map((item, i) => (
          <li key={i}>
            {item.product_name} - {item.quantity} x Rs. {item.price}
          </li>
        ))}
      </ul>
      <input
        className="box"
        type="text"
        placeholder="Enter new status (e.g., shipped)"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      />
      <button className="btn" onClick={updateStatus}>Update Status</button>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </section>
  );
}

export default AdminOrderDetails;
