import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/style.css';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
      setMessage('❌ Please login to view your orders');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
        return;
      }

      try {
      setLoading(true);
      // Fetch orders with error handling
      const ordersRes = await fetch(`http://localhost:5000/api/order/user/${userId}`);
      if (!ordersRes.ok) {
        throw new Error(`HTTP error! status: ${ordersRes.status}`);
      }
      const ordersData = await ordersRes.json();
      
      if (!ordersData.success) {
        throw new Error(ordersData.error || 'Failed to load orders');
      }

      // Fetch user's reviews with error handling
      try {
        const reviewsRes = await fetch(`http://localhost:5000/api/reviews/user/${userId}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          if (reviewsData.success) {
            const reviewed = reviewsData.reviews.map(review => review.product_name);
            setReviewedProducts(reviewed);
          }
        }
      } catch (reviewErr) {
        console.warn('Could not fetch reviews:', reviewErr);
        setReviewedProducts([]);
      }

      // Transform orders data to match the expected format
      const validOrders = (ordersData.orders || []).map(order => ({
        ...order,
        products: (order.items || []).map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.price
        })),
        status: order.order_status || 'placed',
        created_at: order.created_at || new Date().toISOString(),
        total_amount: order.total_price || 0
      }));

      console.log('Transformed orders:', validOrders);
      setOrders(validOrders);
      setLoading(false);
      } catch (err) {
      console.error('Error fetching data:', err);
      setMessage('❌ ' + (err.message || 'Failed to load orders. Please try again later.'));
      setLoading(false);
      if (err.message.includes('401') || err.message.includes('403')) {
        localStorage.removeItem('userId');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    }
  }, [navigate]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Polling for updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchOrders();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [fetchOrders]);

  const openReviewForm = (productName, orderId) => {
    setMessage('⭐ Write a review for: ' + productName);
    setTimeout(() => {
      navigate(`/review?product=${encodeURIComponent(productName)}&orderId=${orderId}`);
    }, 1000);
  };

  const getStatusStyle = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    switch(normalizedStatus) {
      case 'delivered':
        return { color: '#155724', backgroundColor: '#d4edda' };
      case 'dispatched':
        return { color: '#004085', backgroundColor: '#cce5ff' };
      case 'received':
        return { color: '#383d41', backgroundColor: '#e2e3e5' };
      default:
        return { color: '#856404', backgroundColor: '#fff3cd' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? '0' : num.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <section className="orders">
        <h1 className="title">My Orders</h1>
        <div className="loading">Loading your orders...</div>
      </section>
    );
  }

  return (
    <section className="orders">
      <h1 className="title">My Orders</h1>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : message.includes('⭐') ? 'info' : 'error'}`}>
          <span>{message}</span>
          <i className="fas fa-times" onClick={() => setMessage('')}></i>
        </div>
      )}

      {!orders || orders.length === 0 ? (
        <p className="empty">No orders found!</p>
      ) : (
        <div className="box-container">
          {orders.map((order, index) => (
            <div className="box" key={index}>
              <h3>Order Summary</h3>
              <p><b>📅 Order Date:</b> {formatDate(order.created_at)}</p>
              <p><b>📦 Products:</b></p>
              <ul style={{ listStyle: 'none', padding: '1rem' }}>
                {Array.isArray(order.products) && order.products.length > 0 ? (
                  order.products.map((product, idx) => (
                    <li key={idx} style={{ marginBottom: '1rem', borderBottom: idx < order.products.length - 1 ? '1px solid #eee' : 'none', paddingBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{product?.name || 'Unknown Product'}</span>
                          <br />
                          <span style={{ color: '#666', fontSize: '1.3rem' }}>Qty: {product?.quantity || 1}</span>
                        </div>
                        {(order.status || '').toLowerCase() === 'delivered' && (
                          <div>
                            {!reviewedProducts.includes(product?.name) ? (
                          <button
                                className="btn" 
                                style={{ padding: '0.5rem 1rem' }}
                                onClick={() => product?.name && openReviewForm(product.name, order.id)}
                          >
                            Write Review
                          </button>
                            ) : (
                              <span style={{ color: 'var(--purple)', fontSize: '1.4rem' }}>
                                ✓ Reviewed
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      </li>
                  ))
                ) : (
                  <li style={{ color: '#666', fontStyle: 'italic' }}>No products found in this order</li>
                )}
                </ul>
              <p><b>💰 Total:</b> Rs. {formatCurrency(order.total_amount)}</p>
              <p>
                <b>📍 Status:</b> 
                <span style={{
                  ...getStatusStyle(order.status),
                  padding: '0.3rem 1rem',
                  borderRadius: '2rem',
                  marginLeft: '0.5rem',
                  fontSize: '1.4rem',
                  textTransform: 'capitalize'
                }}>
                  {order.status || 'Pending'}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyOrders;





