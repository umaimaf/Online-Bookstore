import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageForProduct } from '../utils/imageMap';
import '../css/style.css';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCartItems();
    // Check for cart message
    const cartMessage = sessionStorage.getItem('cart_message');
    if (cartMessage) {
      setMessage(cartMessage);
      sessionStorage.removeItem('cart_message');
    }
  }, []);

  const fetchCartItems = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('Please login to view cart');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/cart/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch cart items');

      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:5000/api/cart/update-quantity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          item_id: itemId,
          quantity: Number(newQuantity)
        })
      });

      if (!response.ok) throw new Error('Failed to update quantity');

      fetchCartItems(); // Refresh cart
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update quantity');
    }
  };


  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/cart/delete/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to remove item');

      fetchCartItems(); // Refresh cart items
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <section className="shopping-cart">
      <h1 className="title">Shopping Cart</h1>

      {message && (
        <div className="message">
          <span>{message}</span>
          <i className="fas fa-times" onClick={() => setMessage('')}></i>
        </div>
      )}

      <div className="box-container">
        {cartItems.length === 0 ? (
          <div className="empty">Your cart is empty</div>
        ) : (
          cartItems.map(item => (
            <div className="box" key={item.id}>
              <img src={getImageForProduct(item.image)} alt={item.product_name} />
              <div className="name">{item.product_name}</div>
              <div className="price">Rs. {item.price}</div>
              <div className="quantity">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                />
              </div>
              <div className="sub-total">
                Sub Total: <span>Rs. {item.price * item.quantity}</span>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="delete-btn"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-total">
          <p>Grand Total: <span>Rs. {calculateTotal()}</span></p>
          <div className="flex">
            <Link to="/shop" className="option-btn">Continue Shopping</Link>
            <Link to="/checkout" className="btn">Proceed to Checkout</Link>
          </div>
        </div>
      )}
    </section>
  );
}

export default Cart;
