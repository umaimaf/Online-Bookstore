import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../css/style.css'; // Assuming you have your styles already set

function Contact() {
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');  // Assuming user_id is stored in localStorage

  useEffect(() => {
    if (!userId) {
      toast.error('Please login to send messages');
      navigate('/login');
      return;
    }

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      setIsConnecting(true);
      const ws = new WebSocket('ws://localhost:5001');

      ws.onopen = () => {
        console.log('Connected to WebSocket server');
        setSocket(ws);
        setIsConnecting(false);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'confirmation') {
          toast.success('✅ ' + data.message);
          setMessage(''); // Clear message after successful send
        } else if (data.type === 'error') {
          toast.error('❌ ' + data.message);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error. Please try again later.');
        setIsConnecting(false);
      };

      ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
        setSocket(null);
        // Try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      toast.error('Failed to connect to server');
      setIsConnecting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.warning('Please enter a message');
      return;
    }

    if (!userId) {
      toast.error('Please login to send messages');
      navigate('/login');
      return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      toast.error('Connection lost. Reconnecting...');
      connectWebSocket();
      return;
    }

    try {
      socket.send(JSON.stringify({
        user_id: userId,
        message: message.trim()
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <section className="contact">
      <form onSubmit={(e) => e.preventDefault()}>
        <h3>Contact Us</h3>
        <textarea
          className="box"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
        <button 
          type="button" 
          className="btn" 
          onClick={handleSendMessage}
          disabled={isConnecting || !socket}
        >
          {isConnecting ? 'Connecting...' : 'Send Message'}
        </button>
      </form>
    </section>
  );
}

export default Contact;


