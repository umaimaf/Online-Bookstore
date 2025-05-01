import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageForProduct } from '../utils/imageMap';
import '../css/style.css';

function Checkout() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        paymentMethod: 'cash',
        cardNumber: '',
        cardExpiry: '',
        cardCVV: '',
        additionalNotes: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('Please login to proceed');
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

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        try {
            const response = await fetch('http://localhost:5000/api/order/place', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    country: formData.state,  // if you're storing state in 'country' field
                    payment_method: formData.paymentMethod === 'card' ? 'credit card' : 'cash',
                    card_number: formData.cardNumber,
                    expiry_date: formData.cardExpiry,
                    cvv: formData.cardCVV,
                    total_price: calculateTotal(),
                    items: cartItems.map(item => ({
                        product_name: item.product_name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                })
            });
    
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Order failed');
    
            setSuccessMessage(data.message || 'Order placed successfully!');
            navigate('/MyOrders'); // or wherever you want to go after placing order
        } catch (error) {
            console.error('Error during checkout:', error);
            setError('Failed to place order. Please try again.');
        }
    };
    
    

    return (
        <section className="checkout">
            <h1 className="title">Checkout</h1>

            <div className="display-order">
                {cartItems.length === 0 ? (
                    <div className="empty">Your cart is empty</div>
                ) : (
                    <>
                        {cartItems.map(item => (
                            <div className="box" key={item.id}>
                                <img 
                                    src={getImageForProduct(item.image)} 
                                    alt={item.product_name} 
                                />
                                <div>
                                    <h3>{item.product_name}</h3>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Price: Rs. {item.price * item.quantity}</p>
                                </div>
                            </div>
                        ))}
                        <div className="grand-total">
                            Total Amount: <span>Rs. {calculateTotal()}</span>
                        </div>
                    </>
                )}
            </div>

            {cartItems.length > 0 && (
                <form onSubmit={handleSubmit}>
                    <h3>Billing Details</h3>
                    <div className="flex">
                        <div className="inputBox">
                            <h4>Personal Information</h4>
                            <div className="field-group">
                                <span>Full Name <span className="required">*</span></span>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                            <div className="field-group">
                                <span>Email <span className="required">*</span></span>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                            <div className="field-group">
                                <span>Phone Number <span className="required">*</span></span>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="inputBox">
                            <h4>Shipping Address</h4>
                            <div className="field-group">
                                <span>Street Address <span className="required">*</span></span>
                                <textarea 
                                    name="address" 
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                ></textarea>
                            </div>
                            <div className="address-details">
                                <div className="field-group">
                                    <span>City <span className="required">*</span></span>
                                    <input 
                                        type="text" 
                                        name="city" 
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className="field-group">
                                    <span>State <span className="required">*</span></span>
                                    <input 
                                        type="text" 
                                        name="state" 
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className="field-group">
                                    <span>ZIP Code <span className="required">*</span></span>
                                    <input 
                                        type="text" 
                                        name="zipCode" 
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="inputBox">
                            <h4>Payment Method</h4>
                            <div className="payment-methods">
                                <div className="payment-method">
                                    <input 
                                        type="radio" 
                                        id="cash" 
                                        name="paymentMethod" 
                                        value="cash"
                                        checked={formData.paymentMethod === 'cash'}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="cash">Cash on Delivery</label>
                                </div>
                                <div className="payment-method">
                                    <input 
                                        type="radio" 
                                        id="card" 
                                        name="paymentMethod" 
                                        value="card"
                                        checked={formData.paymentMethod === 'card'}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="card">Credit/Debit Card</label>
                                </div>
                            </div>

                            {formData.paymentMethod === 'card' && (
                                <div className="card-details">
                                    <div className="field-group">
                                        <span>Card Number <span className="required">*</span></span>
                                        <input 
                                            type="text" 
                                            name="cardNumber" 
                                            value={formData.cardNumber}
                                            onChange={handleInputChange}
                                            required={formData.paymentMethod === 'card'}
                                        />
                                    </div>
                                    <div className="field-group">
                                        <span>Expiry Date <span className="required">*</span></span>
                                        <input 
                                            type="text" 
                                            name="cardExpiry" 
                                            placeholder="MM/YY"
                                            value={formData.cardExpiry}
                                            onChange={handleInputChange}
                                            required={formData.paymentMethod === 'card'}
                                        />
                                    </div>
                                    <div className="field-group">
                                        <span>CVV <span className="required">*</span></span>
                                        <input 
                                            type="text" 
                                            name="cardCVV" 
                                            value={formData.cardCVV}
                                            onChange={handleInputChange}
                                            required={formData.paymentMethod === 'card'}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="inputBox">
                            <h4>Additional Information</h4>
                            <div className="field-group">
                                <span>Order Notes (Optional)</span>
                                <textarea 
                                    name="additionalNotes"
                                    value={formData.additionalNotes}
                                    onChange={handleInputChange}
                                    placeholder="Notes about your order, e.g. special notes for delivery"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="order-summary">
                        <h4>Order Summary</h4>
                        <div className="summary-item">
                            <span>Subtotal:</span>
                            <span>Rs. {calculateTotal()}</span>
                        </div>
                        <div className="summary-item">
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-item total">
                            <span>Total:</span>
                            <span>Rs. {calculateTotal()}</span>
                        </div>
                    </div>

                    <button type="submit" className="place-order-btn">
                        Place Order
                    </button>
                </form>
            )}
        </section>
    );
}

export default Checkout;
