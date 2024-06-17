import React, { useState, useEffect, useRef, useContext } from 'react';
import './Chat.css';
import { Button } from 'react-bootstrap';
import { useSocket } from '../SocketProvider'; // Assuming you have SocketProvider set up
import UserContext from '../userContext'; // Adjust the path as needed
import { toast } from 'react-toastify'; // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css';

const apiUrl = process.env.REACT_APP_API_URL;

const ChatBox = ({ recipient, visible, setChatBoxes, handleSendMessage }) => {
  const socket = useSocket();
  const { user } = useContext(UserContext); // Assuming UserContext provides user information
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [textareaHeight, setTextareaHeight] = useState(0);
  const [paddingBottom, setPaddingBottom] = useState(0);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    setTextareaHeight(textareaRef.current.scrollHeight);
    setPaddingBottom(textareaHeight - 30);
  };

  useEffect(() => {
    setPaddingBottom(textareaHeight - 30);
  }, [textareaHeight]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() !== '' && recipient && recipient._id) {
      try {
        await handleSendMessage(recipient._id, message);
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

  const fetchConversations = async () => {
    if (!recipient || !recipient._id) {
      return; // Return early if recipient or recipient._id is undefined
    }
    try {
      const response = await fetch(`${apiUrl}/conversations/${recipient._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      setMessages(data.conversation);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [recipient]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (newMessage) => {
        if (newMessage.sender._id === recipient._id || newMessage.recipient._id === user._id) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      };

      socket.on('new_message', handleNewMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket, recipient, user]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!recipient) {
    return null;
  }

  return (
    <div
      className={`chat-box ${visible ? 'visible' : ''}`}
      style={{
        position: 'fixed',
        bottom: '0',
        right: '0',
        width: '100%',
        maxWidth: '400px',
        height: '80%',
        maxHeight: '400px',
        background: 'white',
        border: '1px solid #ddd',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        zIndex: '1000',
        display: visible ? 'block' : 'none',
        flexDirection: 'column',
      }}
    >
      <div className="chat-box-header" style={{ backgroundColor: '#f7f7f7', padding: '10px', borderBottom: '1px solid #ddd' }}>
        <h5>{recipient.name}</h5>
        <Button
          variant="secondary"
          onClick={() => setChatBoxes((prev) => ({ ...prev, [recipient._id]: false }))}
        >
          Close
        </Button>
      </div>
      <div className="chat-box-messages" ref={messagesContainerRef} style={{ flex: '1', padding: '10px', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender._id === user._id ? 'sent' : 'received'}`}>
            <div className="message-content">
              <p>{msg.content}</p>
              <span className="message-sender">{msg.sender.name}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-box-input" style={{ padding: '10px', borderTop: '1px solid #ddd' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            rows="1"
            style={{ resize: 'none', paddingBottom: paddingBottom }}
          />
          <Button type="submit" variant="primary" style={{ marginTop: '10px' }}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
