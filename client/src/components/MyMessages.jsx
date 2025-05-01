import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/style.css';

function MyMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('❌ Please login to view your messages');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/messages/user/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      } else {
        throw new Error(data.error || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('❌ ' + (err.message || 'Failed to load messages'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <section className="messages">
        <h1 className="title">My Messages</h1>
        <div className="loading">Loading your messages...</div>
      </section>
    );
  }

  return (
    <section className="messages">
      <h1 className="title">My Messages</h1>

      {error && (
        <div className="message error">
          <span>{error}</span>
          <i className="fas fa-times" onClick={() => setError('')}></i>
        </div>
      )}

      {messages.length === 0 ? (
        <p className="empty">No messages found!</p>
      ) : (
        <div className="box-container">
          {messages.map((msg, index) => (
            <div className="box" key={index}>
              <div className="message-content">
                <div className="user-message">
                  <p className="text">
                    <strong>Your Message:</strong>
                    <br />
                    {msg.message_content}
                  </p>
                  <span className="date">Sent on: {formatDate(msg.created_at)}</span>
                </div>

                {msg.reply_content && (
                  <div className="admin-reply">
                    <p className="text">
                      <strong>Admin Reply:</strong>
                      <br />
                      {msg.reply_content}
                    </p>
                    <span className="date">Replied on: {formatDate(msg.reply_date)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyMessages; 