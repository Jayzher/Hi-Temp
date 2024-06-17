import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { Button } from 'react-bootstrap';
import { useSocket } from '../SocketProvider'; // Assuming you have SocketProvider set up

const apiUrl = process.env.REACT_APP_API_URL;

const ChatBox = ({ recipient, visible, setChatBoxes }) => {
  const socket = useSocket(); // Get the socket instance using useSocket hook
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [textareaHeight, setTextareaHeight] = useState(0);
  const [paddingBottom, setPaddingBottom] = useState(0);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Function to handle changes in the message input textarea
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  // Function to adjust textarea height based on content
  const adjustTextareaHeight = () => {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    setTextareaHeight(textareaRef.current.scrollHeight);
    setPaddingBottom(textareaHeight - 30);
  };

  // Effect to update padding bottom when textarea height changes
  useEffect(() => {
    setPaddingBottom(textareaHeight - 30);
  }, [textareaHeight]);

  // Function to handle form submission (sending message)
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

        // Clear message input and adjust textarea height
        setMessage('');
        textareaRef.current.style.height = 'auto';
        setTextareaHeight(0);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.error('Recipient ID is missing');
    }
  };

  // Effect to fetch initial messages when recipient changes
  useEffect(() => {
    const fetchConversations = async () => {
      if (!recipient || !recipient._id) {
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
  }, [recipient]);

  // Effect to handle incoming socket messages
  useEffect(() => {
    const handleMessageEvent = (newMessage) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    if (socket) {
      socket.on('new_message', handleMessageEvent);
    }

    return () => {
      if (socket) {
        socket.off('new_message', handleMessageEvent);
      }
    };
  }, [socket, recipient]);

  // Effect to scroll messages container to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Render nothing if recipient is not provided
  if (!recipient) {
    return null;
  }

  // Render chat box component
  return (
    <div className={`chat-box ${visible ? 'visible' : 'hidden'}`}>
      <div className="header">
        <p>{recipient.name}</p>
        <button onClick={() => setChatBoxes(prevChatBoxes => ({ ...prevChatBoxes, [recipient._id]: false }))}>Close</button>
      </div>
      <div className="messages" ref={messagesContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender.id === recipient._id ? 'received' : 'sent'}>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="footer">
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            rows="1"
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
