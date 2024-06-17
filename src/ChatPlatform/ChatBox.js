import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { Button } from 'react-bootstrap';
import { useSocket } from '../SocketProvider'; // Assuming you have SocketProvider set up
import { useNotification } from '../NotificationContext'; // Adjust the path as needed

const apiUrl = process.env.REACT_APP_API_URL;

const ChatBox = ({ recipient, visible, setChatBoxes }) => {
  const socket = useSocket(); // Get the socket instance using useSocket hook
  const { showInfoNotification } = useNotification(); // Using showInfoNotification from NotificationContext
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
        textareaRef.current.style.height = 'auto';
        setTextareaHeight(0);

        // Show success notification on successful message send
        showInfoNotification('Message sent');
      } catch (error) {
        console.error('Error sending message:', error);

        // Show error notification on failed message send
        showInfoNotification('Failed to send message');
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
  }, [recipient]);

  useEffect(() => {
    const handleMessageEvent = (newMessage) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
      showInfoNotification('New message received');
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

  useEffect(() => {
    // Scroll to the bottom of the messages container when new messages arrive
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!recipient) {
    return null;
  }

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div id="chat-box" className={`chat-box ${visible ? 'visible' : 'hidden'} flex-column ms-3 mt-3 hide-on-small`} style={{display: "flex"}}>
        <div className="header d-flex flex-row justify-content-between">
          <p style={{ fontSize: '1.1rem', fontWeight: "bolder" }}>{recipient.name}</p>
          <button className="text-center fw-bold" style={{background: "rgba(0, 0, 0, 0.3)", borderRadius: "100px", fontSize: "0.8rem", height: "30px"}} onClick={() => setChatBoxes(prevChatBoxes => ({ ...prevChatBoxes, [recipient._id]: false }))}>
            X
          </button>
        </div>
        <div className="messages">
          <div className="messages-container" style={{minHeight: "100%"}} ref={messagesContainerRef}>
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
              ref={textareaRef}
              style={{ height: 'auto', overflow: 'hidden', width: '80%' }}
              rows="1"
              className="me-1 textarea-input"
              value={message}
              onChange={handleMessageChange}
              placeholder="Type your message..."
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>
      <div className="show-on-small" style={{ display: "none", height: "100%", minHeight: "90vh" }}>
        <div className="messages-container" ref={messagesContainerRef} style={{ flexGrow: 1, overflowY: 'auto', position: "fixed", bottom: "10vh", width: "100%", height: `82vh`, paddingBottom: `${paddingBottom}px` }}>
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender.id === recipient._id ? 'received' : 'sent'}>
              <p className="msg-content">{msg.content}</p>
            </div>
          ))}
        </div>
        <div className="footer" style={{ position: "fixed", zIndex: "10", width: "100%", right: "0", bottom: "0", background: "linear-gradient(184.1deg, rgb(249, 255, 182) 44.7%, rgb(226, 255, 172) 67.2%)", padding: "10px 0" }}>
          <form className="d-flex flex-row ms-2 justify-content-end align-items-center" onSubmit={handleSubmit} style={{ width: '100%' }}>
            <textarea
              ref={textareaRef}
              style={{ height: 'auto', overflow: 'hidden', width: '80%' }}
              rows="2"
              className="me-1 textarea-input"
              value={message}
              onChange={handleMessageChange}
              placeholder="Type your message..."
            />
            <Button type="submit" style={{ width: '20%' }}>Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;