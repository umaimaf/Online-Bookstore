import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../css/admin_style.css';

function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        fetchMessages();
        connectWebSocket();

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    const connectWebSocket = () => {
        const ws = new WebSocket('ws://localhost:5001');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message') {
                // Add new message to the list
                setMessages(prevMessages => [{
                    id: Date.now(), // Temporary ID until refresh
                    user_id: data.data.user_id,
                    message_content: data.data.message_content,
                    created_at: data.data.created_at,
                    user_name: 'User' // Will be updated on next fetch
                }, ...prevMessages]);
                
                // Show notification
                toast.info('New message received!');
                
                // Refresh messages to get complete data
                fetchMessages();
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            toast.error('WebSocket connection error');
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
            // Try to reconnect after 5 seconds
            setTimeout(connectWebSocket, 5000);
        };
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                toast.error('Please login first');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/admin/messages', {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setMessages(response.data.messages);
            } else {
                toast.error('Failed to fetch messages');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error(error.response?.data?.error || 'Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            const response = await axios.delete(`http://localhost:5000/api/admin/messages/${messageId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.success('Message deleted successfully');
                fetchMessages(); // Refresh the list
            } else {
                toast.error('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error(error.response?.data?.error || 'Failed to delete message');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (messageId) => {
        try {
            if (!replyContent.trim()) {
                toast.error('Please enter a reply');
                return;
            }

            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            const response = await axios.post(
                `http://localhost:5000/api/admin/messages/${messageId}/reply`,
                { reply_content: replyContent },
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Reply sent successfully');
                setReplyContent('');
                setReplyingTo(null);
                fetchMessages(); // Refresh the list
            } else {
                toast.error('Failed to send reply');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error(error.response?.data?.error || 'Failed to send reply');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-messages">
            <div className="header">
                <h1>Messages</h1>
                <div className="message-count">
                    {messages.length} Messages
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading messages...</div>
            ) : (
                <div className="table-container">
                    <table className="messages-table">
                        <thead>
                            <tr>
                                <th>Message ID</th>
                                <th>User</th>
                                <th>Message</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No messages found
                                    </td>
                                </tr>
                            ) : (
                                messages.map(message => (
                                    <React.Fragment key={message.id}>
                                        <tr>
                                            <td>#{message.id}</td>
                                            <td>{message.user_name}</td>
                                            <td style={{ maxWidth: '400px', whiteSpace: 'pre-wrap' }}>
                                                {message.message_content}
                                            </td>
                                            <td>{new Date(message.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        onClick={() => setReplyingTo(message.id)}
                                                        className="btn"
                                                    >
                                                        Reply
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteMessage(message.id)}
                                                        className="delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {replyingTo === message.id && (
                                            <tr>
                                                <td colSpan="5">
                                                    <div className="reply-section">
                                                        <textarea
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            placeholder="Type your reply here..."
                                                            className="reply-textarea"
                                                        />
                                                        <div className="button-group">
                                                            <button 
                                                                onClick={() => handleReply(message.id)}
                                                                className="btn"
                                                                disabled={loading}
                                                            >
                                                                Send
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setReplyingTo(null);
                                                                    setReplyContent('');
                                                                }}
                                                                className="delete-btn"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminMessages;
