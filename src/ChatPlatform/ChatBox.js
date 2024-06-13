import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { Button } from 'react-bootstrap';

const apiUrl = process.env.REACT_APP_API_URL;

const ChatBox = ({ recipient, visible, setChatBoxes }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const textareaRef = useRef(null);
  const chatBoxRef = useRef(null);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    chatBoxRef.current.style.height = `${chatBoxRef.current.style.height - textareaRef.current.scrollHeight}px`;
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
        textareaRef.current.style.height = 'auto';
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
  }, [recipient]);

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
    <div style={{width: "100%", height: "100vh !important"}}>
      <div id="chat-box" className={`chat-box ${visible ? 'visible' : 'hidden'} flex-column ms-3 mt-3 hide-on-small`} style={{display: "flex"}}>
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
              ref={textareaRef}
              style={{ height: 'auto', overflow: 'hidden' }}
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
      <div className="show-on-small" style={{display: "none"}}>
        <div className="messages" ref={chatBoxRef} style={{height: `${chatBoxRef + 80}vw`, minHeight: "90vh", overflowY: "auto"}}>
          <div className="messages-container" style={{maxWidth: "40% !important"}}>
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender.id === recipient._id ? 'received' : 'sent'}>
                <p className="msg-content">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="footer" style={{position: "sticky", width: "100%", right: "0", bottom: "0", background: "linear-gradient(184.1deg, rgb(249, 255, 182) 44.7%, rgb(226, 255, 172) 67.2%)"}}>
          <form className="d-flex flex-row ms-2 justify-content-end" onSubmit={handleSubmit} style={{ width: '100%'}}>
            <textarea 
              ref={textareaRef}
              style={{ height: 'auto', overflow: 'hidden', width: '100%'}}
              rows="1"
              className="me-1 textarea-input"
              value={message}
              onChange={handleMessageChange}
              placeholder="Type your message..."
            />
            <Button style={{ maxHeight: "40px", height: "40px" }} type="submit">Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
