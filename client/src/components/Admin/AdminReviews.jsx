import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../css/admin_style.css';

function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                toast.error('Please login first');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/admin/reviews', {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setReviews(response.data.reviews);
            } else {
                toast.error('Failed to fetch reviews');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error(error.response?.data?.error || 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            const response = await axios.delete(`http://localhost:5000/api/admin/reviews/${reviewId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.success('Review deleted successfully');
                fetchReviews(); // Refresh the list
            } else {
                toast.error('Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error(error.response?.data?.error || 'Failed to delete review');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return <span className="rating-stars">{'⭐'.repeat(rating)}</span>;
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="admin-reviews">
            <div className="header">
                <h1>Book Reviews</h1>
                <div className="review-count">
                    {reviews.length} Reviews
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading reviews...</div>
            ) : (
                <div className="table-container">
                    <table className="reviews-table">
                        <thead>
                            <tr>
                                <th>#ID</th>
                                <th>Book Title</th>
                                <th>Customer</th>
                                <th>Rating</th>
                                <th>Review</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-table">
                                        No reviews found
                                    </td>
                                </tr>
                            ) : (
                                reviews.map(review => (
                                    <tr key={review.id}>
                                        <td>#{review.id}</td>
                                        <td>{review.product_name}</td>
                                        <td>{review.user_name}</td>
                                        <td>{renderStars(review.rating)}</td>
                                        <td className="comment-cell">
                                            {review.comment}
                                        </td>
                                        <td className="date-cell">
                                            {formatDate(review.created_at)}
                                        </td>
                                        <td className="action-cell">
                                            <button 
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="delete-btn"
                                                title="Delete Review"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
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

export default AdminReviews;
