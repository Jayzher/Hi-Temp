import React, { useState, useEffect, useContext } from 'react';
import { useSocket } from '../SocketProvider'; // Import useSocket hook from SocketProvider
import UsersLists from './UsersLists';
import ChatBox from './ChatBox';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../NotificationContext'; // Adjust the path as needed
import '../components/Style.css';
import './Chat.css';
import UserContext from '../userContext'; // Adjust the path as needed

const ChatRoom = () => {
  const socket = useSocket(); // Get the socket instance using useSocket hook
  const { showNotification } = useNotification();
  const [userList, setUserList] = useState([]);
  const [chatBoxes, setChatBoxes] = useState({});
  const [showUsers, setShowUsers] = useState(true); // Add state to control the visibility of the user list
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700); // State to track if the device is mobile
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchUserList();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 700);
      if (window.innerWidth >= 700) {
        setShowUsers(true); // Show user list if screen width is greater than or equal to 700px
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchUserList = () => {
    fetch(`${process.env.REACT_APP_API_URL}/users/alldetails`)
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
    const updatedChatBoxes = {};
    data.forEach((user) => {
      updatedChatBoxes[user._id] = {
        visible: false,
        messages: [],
      };
    });
    setChatBoxes(updatedChatBoxes);
  };

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (newMessage) => {
        handleNewMessage(newMessage);
      });

      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket]);

  const handleNewMessage = (newMessage) => {
    if (newMessage.recipient.id === user.id || newMessage.sender.id === user.id) {
      setChatBoxes((prevChatBoxes) => ({
        ...prevChatBoxes,
        [newMessage.sender.id]: {
          visible: true,
          messages: [...(prevChatBoxes[newMessage.sender.id]?.messages || []), newMessage],
        },
        [newMessage.recipient.id]: {
          visible: true,
          messages: [...(prevChatBoxes[newMessage.recipient.id]?.messages || []), newMessage],
        },
      }));
      showNotification(`New message from ${newMessage.sender.name}`);
    }
  };

  const handleUserSelect = (user) => {
    setChatBoxes((prevChatBoxes) => ({
      ...prevChatBoxes,
      [user._id]: {
        ...prevChatBoxes[user._id],
        visible: true,
      },
    }));
    if (isMobile) {
      setShowUsers(false); // Hide user list when a user is selected on mobile
    }
  };

  const handleSendMessage = (recipientId, messageContent) => {
    socket.emit('send_message', { recipientId, content: messageContent });
    setChatBoxes((prevChatBoxes) => ({
      ...prevChatBoxes,
      [recipientId]: {
        ...prevChatBoxes[recipientId],
        messages: [...(prevChatBoxes[recipientId]?.messages || []), { content: messageContent, sender: { id: user.id, name: user.name } }],
      },
    }));
    showNotification('Message sent');
  };

  const handleBackClick = () => {
    setShowUsers(true); // Show user list on back button click
    setChatBoxes({}); // Hide all chat boxes
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
              recipient={chatBoxes[user._id] && chatBoxes[user._id].visible ? user : null}
              visible={chatBoxes[user._id] && chatBoxes[user._id].visible}
              setChatBoxes={setChatBoxes}
              messages={chatBoxes[user._id] && chatBoxes[user._id].messages ? chatBoxes[user._id].messages : []}
              handleSendMessage={handleSendMessage}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
