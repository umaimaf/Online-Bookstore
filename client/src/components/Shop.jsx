import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/style.css';
import { getImageForProduct, defaultImage } from '../utils/imageMap';

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('search') || '';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleAddToCart = async (product) => {
    try {
      const userIdStr = localStorage.getItem('userId');
      if (!userIdStr) {
        setMessage('❌ Please login to add items to cart');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return;
      }

      const userId = parseInt(userIdStr, 10);
      if (isNaN(userId) || userId <= 0) {
        console.error('Invalid user ID format:', userIdStr);
        localStorage.removeItem('userId');
        setMessage('❌ Session expired. Please login again.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return;
      }

      const payload = {
        user_id: userId,
        product_name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      };

      const cartRes = await fetch(`http://localhost:5000/api/cart/${userId}`);
      if (!cartRes.ok) throw new Error('Failed to fetch cart');
      
      const cartData = await cartRes.json();
      if (cartData.some(item => item.product_name === product.name)) {
        sessionStorage.setItem("cart_message", "⚠️ Item already in cart");
        navigate('/cart');
        return;
      }

      const res = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add to cart");
      }

      sessionStorage.setItem("cart_message", "✅ Added to cart successfully!");
      navigate('/cart');

    } catch (error) {
      console.error('Cart error:', error);
      setMessage('❌ ' + (error.message || "Failed to update cart. Please try again."));
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <section className="products">
      <h1 className="title">All Products</h1>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : message.includes('⚠️') ? 'warning' : 'error'}`}>
          <span>{message}</span>
          <i className="fas fa-times" onClick={() => setMessage('')}></i>
        </div>
      )}

      <div className="box-container">
        {filtered.length === 0 ? (
          <p className="empty">No products found!</p>
        ) : (
          filtered.map(product => (
            <div className="box" key={product.id}>
              <div className="image">
                <img 
                  src={getImageForProduct(product.image)} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                  }}
                />
              </div>
              <div className="content">
                <h3>{product.name}</h3>
                <div className="price">Rs. {product.price}</div>
                <button 
                  className="btn" 
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Shop;

