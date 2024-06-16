import React, { useState, useEffect } from 'react';
import { useSocket } from '../SocketProvider';
import UsersLists from './UsersLists';
import ChatBox from './ChatBox';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../NotificationContext';
import '../components/Style.css';
import './Chat.css';

const apiUrl = process.env.REACT_APP_API_URL;

const ChatRoom = () => {
  const socket = useSocket();
  const { showNotification } = useNotification();
  const [userList, setUserList] = useState([]);
  const [chatBoxes, setChatBoxes] = useState({});
  const [showUsers, setShowUsers] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserList();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 700);
      if (window.innerWidth >= 700) {
        setShowUsers(true);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchUserList = () => {
    fetch(`${apiUrl}/users/alldetails`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user list');
        }
        return response.json();
      })
      .then((data) => {
        setUserList(data);
        initializeChatBoxes(data);
      })
      .catch((error) => {
        console.error('Error fetching user list:', error);
        showNotification('Failed to fetch user list');
      });
  };

  const initializeChatBoxes = (data) => {
    const updatedChatBoxes = { ...chatBoxes };
    data.forEach((user) => {
      if (!updatedChatBoxes[user._id]) {
        updatedChatBoxes[user._id] = false;
      }
    });
    setChatBoxes(updatedChatBoxes);
  };

  useEffect(() => {
    if (socket) {
      socket.on('new_message', handleNewMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket]);

  const handleNewMessage = (newMessage) => {
    const senderName = newMessage.sender?.name || 'Unknown';
    if (senderName !== user.name) {
      showNotification(`New message from ${senderName}`);
    }
  };

  const handleUserSelect = (user) => {
    setChatBoxes((prevChatBoxes) => ({
      ...prevChatBoxes,
      [user._id]: !prevChatBoxes[user._id],
    }));
    if (isMobile) {
      setShowUsers(false);
    }
  };

  const handleSendMessage = (recipientId, messageContent) => {
    socket.emit('send_message', { recipientId, content: messageContent });
    showNotification('Message sent');
  };

  const handleBackClick = () => {
    setShowUsers(true);
    setChatBoxes({});
  };

  return (
    <div className="dashboard-container" style={{ overflow: 'hidden', height: '100vh' }}>
      <div id="Chatroom-container" className="d-flex flex-row" style={{ height: '100%', maxHeight: '100vh', marginLeft: '15vw', width: '85vw', overflowY: 'hidden' }}>
        {!showUsers && isMobile && (
          <div className="d-flex align-items-center justify-content-end" style={{ background: 'rgba(0, 0, 0, 0.7)', height: 'fit-content', width: '100%', padding: '5px', position: 'absolute', top: '0', zIndex: '10' }}>
            <button onClick={handleBackClick} style={{ color: 'white', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              &#8592; Back
            </button>
          </div>
        )}
        <div className="user-list-container" style={{ width: '20%', background: '#f0f0f0' }} hidden={!showUsers}>
          <h3 className="ms-5 p-2">User List</h3>
          <UsersLists userList={userList} onSelectUser={handleUserSelect} />
        </div>
        <div className="d-flex flex-wrap" style={{ backgroundImage: 'linear-gradient(184.1deg, rgba(249,255,182,1) 44.7%, rgba(226,255,172,1) 67.2%)', flex: 1, position: 'relative' }}>
          {userList.map((user) => (
            <ChatBox
              key={user._id}
              recipient={chatBoxes[user._id] ? user : null}
              visible={!!chatBoxes[user._id]}
              setChatBoxes={setChatBoxes}
              socket={socket}
              handleSendMessage={handleSendMessage}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
