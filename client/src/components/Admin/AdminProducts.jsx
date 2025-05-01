import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../css/admin_style.css';
import { getImageForProduct, defaultImage } from '../../utils/imageMap';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        category: '',
        stock: ''
    });
    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                toast.error('Please login first');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/admin/products', {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setProducts(response.data.products);
            } else {
                toast.error('Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again');
                localStorage.removeItem('adminToken');
            } else {
                toast.error(error.response?.data?.error || 'Failed to fetch products');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setFormData(prev => ({
                ...prev,
                image: file.name
            }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');

            if (!token) {
                toast.error('Please login first');
                return;
            }

            // Validate form data
            if (!formData.name || !formData.price || !formData.description || (!formData.image && !imageFile) || !formData.stock) {
                toast.error('Please fill all required fields');
                return;
            }

            let imageUrl = formData.image;
            if (imageFile) {
                const formDataWithImage = new FormData();
                formDataWithImage.append('image', imageFile);
                
                try {
                    console.log('Uploading image...'); // Debug log
                    const uploadResponse = await axios.post('http://localhost:5000/api/admin/upload', formDataWithImage, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (uploadResponse.data && uploadResponse.data.filename) {
                        console.log('Image uploaded successfully:', uploadResponse.data.filename); // Debug log
                        imageUrl = uploadResponse.data.filename;
                    } else {
                        throw new Error('Invalid response from image upload');
                    }
                } catch (error) {
                    console.error('Image upload error:', error);
                    toast.error('Failed to upload image: ' + (error.response?.data?.error || error.message));
                    return;
                }
            }

            const productData = {
                name: formData.name,
                price: parseFloat(formData.price),
                description: formData.description,
                image: imageUrl,
                category: formData.category || '',
                stock: parseInt(formData.stock)
            };

            console.log('Submitting product data:', productData); // Debug log

            if (selectedProduct) {
                // Update existing product
                const response = await axios.put(`http://localhost:5000/api/admin/products/${selectedProduct.id}`, productData, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.data.success) {
                toast.success('Book updated successfully');
                } else {
                    throw new Error(response.data.error || 'Failed to update book');
                }
            } else {
                // Add new product
                const response = await axios.post('http://localhost:5000/api/admin/products', productData, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.data.success) {
                toast.success('Book added successfully');
                } else {
                    throw new Error(response.data.error || 'Failed to add book');
                }
            }

            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedProduct(null);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Operation error:', error);
            toast.error(error.response?.data?.error || error.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            description: product.description,
            image: product.image,
            category: product.category || '',
            stock: product.stock.toString()
        });
        setImagePreview(getImageForProduct(product.image));
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            await axios.delete(`http://localhost:5000/api/admin/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Book deleted successfully');
            setSelectedProduct(null);
            fetchProducts();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.error || 'Failed to delete book');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            description: '',
            image: '',
            category: '',
            stock: ''
        });
        setImagePreview('');
        setImageFile(null);
    };

    const Modal = ({ show, onClose, title, children }) => {
        if (!show) return null;
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>{title}</h2>
                        <button onClick={onClose} className="close-btn">&times;</button>
                    </div>
                    {children}
                </div>
            </div>
        );
    };

    const ProductForm = () => (
        <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
                <label htmlFor="name">Book Title:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter book title"
                    autoComplete="off"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="price">Price:</label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    autoComplete="off"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                    autoComplete="off"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="image">Image:</label>
                <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                />
                {imagePreview && (
                    <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxWidth: '200px', marginTop: '10px' }}
                    />
                )}
            </div>
            <div className="form-group">
                <label htmlFor="category">Category:</label>
                <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Enter category"
                    autoComplete="off"
                />
            </div>
            <div className="form-group">
                <label htmlFor="stock">Stock:</label>
                <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="Enter stock quantity"
                    autoComplete="off"
                    required
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : (selectedProduct ? 'Update Book' : 'Add Book')}
            </button>
        </form>
    );

    return (
        <div className="admin-products">
            <div className="header">
                <h1>Books</h1>
                <div className="book-count">
                    {products.length} Books
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading books...</div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Cover</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Price (Rs.)</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No books found in the database
                                        </td>
                                    </tr>
                                ) : (
                                    products.map(product => (
                                        <tr key={product.id}>
                                            <td className="product-image-cell">
                                                <img 
                                                    src={getImageForProduct(product.image)}
                                                    alt={product.name} 
                                                    className="product-thumbnail"
                                                />
                                            </td>
                                            <td>{product.name}</td>
                                            <td>{product.category || '-'}</td>
                                            <td>{product.price.toLocaleString()}</td>
                                            <td>{product.stock}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="edit-btn"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="add-btn-container">
                        <button 
                            onClick={() => {
                                resetForm();
                                setShowAddModal(true);
                            }}
                            className="btn"
                        >
                            Add New Book
                        </button>
                    </div>
                </>
            )}

            <Modal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Book"
            >
                <ProductForm />
            </Modal>

            <Modal
                show={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                    resetForm();
                }}
                title="Edit Book"
            >
                <ProductForm />
            </Modal>
        </div>
    );
};

export default AdminProducts;

