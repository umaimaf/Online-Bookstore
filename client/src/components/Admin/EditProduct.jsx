import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/admin_style.css';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', price: '', image: '', description: '' });

  useEffect(() => {
    fetch(`http://localhost:5000/api/admin/products/${id}`)
      .then(res => res.json())
      .then(data => setForm(data));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:5000/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    navigate('/admin/products');
  };

  return (
    <section className="add-products">
      <form onSubmit={handleSubmit}>
        <h3>Edit Product</h3>
        <input type="text" className="box" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="text" className="box" value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })} required />
        <input type="number" className="box" value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <textarea className="box" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <button type="submit" className="btn">Update Product</button>
      </form>
    </section>
  );
}

export default EditProduct;
