import React, { useState } from 'react';
import '../../css/admin_style.css';

function AddProduct() {
  const [form, setForm] = useState({ name: '', price: '', image: '', description: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMessage(data.message || 'Something went wrong');
    setForm({ name: '', price: '', image: '', description: '' });
  };

  return (
    <section className="add-products">
      <form onSubmit={handleSubmit}>
        <h3>Add New Product</h3>
        <input type="text" placeholder="Product Name" className="box" required
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="text" placeholder="Image URL" className="box" required
          value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <input type="number" placeholder="Price" className="box" required
          value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <textarea placeholder="Description" className="box" required
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit" className="btn">Add Product</button>
        {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
      </form>
    </section>
  );
}

export default AddProduct;
