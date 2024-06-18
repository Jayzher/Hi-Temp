import React, { useState, useEffect, useRef, useReducer, useContext } from 'react';
import './Chat.css';
import { Button } from 'react-bootstrap';
import { useSocket } from '../SocketProvider';
import UserContext from '../userContext'; // Adjust the path as per your project structure

const apiUrl = process.env.REACT_APP_API_URL;

const initialState = {
  messageInput: '',
  conversations: {}, // Dictionary to store messages for each recipient
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_MESSAGE_INPUT':
      return {
        ...state,
        messageInput: action.payload,
      };
    case 'ADD_MESSAGE':
      const { recipientId, message } = action.payload;
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [recipientId]: [...(state.conversations[recipientId] || []), message],
        },
        messageInput: '', // Clear message input after sending
      };
    case 'SET_MESSAGES':
      const { recipientId: id, messages } = action.payload;
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [id]: messages,
        },
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [action.payload]: [], // Clear messages for a specific recipient
        },
      };
    default:
      return state;
  }
};

const ChatBox = ({ recipient, visible, setChatBoxes }) => {
  const socket = useSocket();
  const { user } = useContext(UserContext); // Assuming user is accessed via context
  const [state, dispatch] = useReducer(reducer, initialState);
  const { messageInput, conversations } = state;
  const messages = conversations[recipient?._id] || [];

  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Function to handle message input change
  const handleMessageChange = (e) => {
    dispatch({ type: 'SET_MESSAGE_INPUT', payload: e.target.value });
    adjustTextareaHeight();
  };

  // Adjust textarea height based on content
  const adjustTextareaHeight = () => {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  // Function to handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (messageInput.trim() !== '' && recipient && recipient._id) {
      try {
        const response = await fetch(`${apiUrl}/messages/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            content: messageInput,
            recipientId: recipient._id,
            recipientName: recipient.name,
            department: recipient.department
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const newMessage = {
          content: messageInput,
          sender: { id: user.id, name: localStorage.getItem('username') } // Assuming user.id is accessible
        };

        // Clear message input and adjust textarea
        dispatch({ type: 'SET_MESSAGE_INPUT', payload: '' });
        adjustTextareaHeight();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.error('Recipient ID is missing');
    }
  };

  // Effect to fetch conversation messages when recipient changes
  useEffect(() => {
    const fetchConversations = async () => {
      if (!recipient || !recipient._id) {
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
        dispatch({ type: 'SET_MESSAGES', payload: { recipientId: recipient._id, messages: data } });
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    // Clear messages for previous recipient when recipient changes
    dispatch({ type: 'CLEAR_MESSAGES', payload: recipient?.id });

    fetchConversations();
  }, [recipient]);

  // Effect to handle new incoming messages via socket
  useEffect(() => {
    const handleMessageEvent = (newMessage) => {
      if (
        (newMessage.recipient.id === recipient?._id && newMessage.sender.id === user.id) ||
        (newMessage.sender.id === recipient?._id && newMessage.recipient.id === user.id)
      ) {
        dispatch({ type: 'ADD_MESSAGE', payload: { recipientId: recipient._id, message: newMessage } });
      }
    };

    if (socket) {
      socket.on('new_message', handleMessageEvent);
    }

    return () => {
      if (socket) {
        socket.off('new_message', handleMessageEvent);
      }
    };
  }, [socket, user]); // Include user in dependencies

  // Effect to scroll to bottom of messages container on new messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Return null if recipient is not defined
  if (!recipient) {
    return null;
  }

  // Render the chat box component
  return (
    <>
      {/* Desktop Version */}
      <div className={`chat-box ${visible ? 'visible' : 'hidden'} flex-column ms-3 mt-3 hide-on-small`} style={{ display: "flex" }}>
        <div className="header d-flex flex-row justify-content-between">
          <p style={{ fontSize: '1.1rem', fontWeight: "bolder" }}>{recipient.name}</p>
          <button className="text-center fw-bold" style={{ background: "rgba(0, 0, 0, 0.3)", borderRadius: "100px", fontSize: "0.8rem", height: "30px" }} onClick={() => setChatBoxes(prevChatBoxes => ({ ...prevChatBoxes, [recipient._id]: false }))}>
            X
          </button>
        </div>
        <div className="messages">
          <div className="messages-container" style={{ minHeight: "100%" }} ref={messagesContainerRef}>
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
              value={messageInput}
              onChange={handleMessageChange}
              placeholder="Type your message..."
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="show-on-small" style={{ display: "none", height: "100%", minHeight: "90vh" }}>
        <div className="messages-container" ref={messagesContainerRef} style={{ flexGrow: 1, overflowY: 'auto', position: "fixed", bottom: "10vh", width: "100%", height: `82vh` }}>
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
              value={messageInput}
              onChange={handleMessageChange}
              placeholder="Type your message..."
            />
            <Button type="submit" style={{ width: '20%' }}>Send</Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatBox;
