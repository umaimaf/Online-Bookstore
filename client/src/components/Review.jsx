import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/style.css';

function Review() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [productName, setProductName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const product = params.get('product');
    const orderId = params.get('orderId');
    if (product && orderId) {
      setProductName(product);
    } else {
      setMessage('❌ Missing product or order information');
      setTimeout(() => {
        navigate('/myorders');
      }, 1500);
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setMessage('❌ Please login first!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (!rating || !comment.trim()) {
      setMessage('⚠️ Please give rating and comment.');
      return;
    }

    const orderId = new URLSearchParams(location.search).get('orderId');
    if (!orderId) {
      setMessage('❌ Order information is missing');
      return;
    }

    const payload = {
      user_id: Number(userId),
      product_name: productName,
      order_id: Number(orderId),
      rating,
      comment
    };

    try {
      const res = await fetch('http://localhost:5000/api/reviews/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Review submitted successfully!');
        setTimeout(() => {
          navigate('/myorders');
        }, 1500);
      } else {
        setMessage('❌ ' + (data.error || 'Failed to submit review'));
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setMessage('❌ Server error');
    }
  };

  return (
    <section className="review">
      <h1 className="title">Write a Review</h1>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : message.includes('⚠️') ? 'warning' : 'error'}`}>
          <span>{message}</span>
          <i className="fas fa-times" onClick={() => setMessage('')}></i>
        </div>
      )}

      <form className="review-form" onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>
          Reviewing: <span style={{ color: '#27ae60' }}>{productName}</span>
        </h2>

        <div className="inputBox">
          <span>Rating (1-5) *</span>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            required
          />
        </div>

        <div className="inputBox">
          <span>Your Review *</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="Write your review here..."
          ></textarea>
        </div>

        <button type="submit" className="btn">Submit Review</button>
      </form>
    </section>
  );
}

export default Review;
