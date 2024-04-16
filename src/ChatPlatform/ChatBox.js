import React, { useState, useEffect } from 'react';
import './Chat.css';
import { Button } from 'react-bootstrap';

const apiUrl = process.env.REACT_APP_API_URL;

const ChatBox = ({ recipient, visible, setChatBoxes }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() !== '' && recipient && recipient._id) {
      try {
        const response = await fetch(`${apiUrl}/messages/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            content: message,
            recipientId: recipient._id,
            recipientName: recipient.name,
            department: recipient.department
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.error('Recipient ID is missing');
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      if (!recipient || recipient._id === null) {
        console.log("Recipient or recipient._id is null");
        return; // Return early if recipient or recipient._id is null
      }

      try {
        const response = await fetch(`${apiUrl}/messages/conversation/${recipient._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };
    fetchConversations();
  }, [recipient, messages]); // Include messages state in the dependency array

  useEffect(() => {
    // Event listener for new message
    const handleMessageEvent = (newMessage) => {
      // Add the new message to the messages array
      setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    // Listen for new messages emitted from the server
    window.addEventListener('new_message', handleMessageEvent);

    // Clean up the event listener
    return () => {
      window.removeEventListener('new_message', handleMessageEvent);
    };
  }, []);

  if (!recipient) {
    return null;
  }

  return (
    <div className={`chat-box ${visible ? 'visible' : 'hidden'} d-flex flex-column ms-3 mt-3`}>
      <div className="header d-flex flex-row justify-content-between">
        <p style={{ fontSize: '1.1rem', fontWeight: "bolder" }}>{recipient.name}</p>
        <button className="text-center fw-bold" style={{background: "rgba(0, 0, 0, 0.3)", borderRadius: "100px", fontSize: "0.8rem", height: "30px"}} onClick={() => setChatBoxes(prevChatBoxes => ({ ...prevChatBoxes, [recipient._id]: false }))}>
          X
        </button>
      </div>
      <div className="messages">
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender.id === recipient._id ? 'received' : 'sent'}>
              <p className="msg-content">{msg.content}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="footer">
        <form className="d-flex flex-row justify-content-around" onSubmit={handleSubmit} style={{ width: '100%' }}>
          <textarea
            sizeable="false"
            className="me-1 textarea-input"
            value={message}
            onChange={handleMessageChange}
            placeholder="Type your message..."
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
