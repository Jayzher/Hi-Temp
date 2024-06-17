import React, { useState, useEffect, useContext } from 'react';
import { useSocket } from '../SocketProvider';
import UsersLists from './UsersLists';
import ChatBox from './ChatBox';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../components/Style.css';
import './Chat.css';
import UserContext from '../userContext'; // Import UserContext
import { useNotification } from '../NotificationContext';

const ChatRoom = () => {
  const socket = useSocket();
  const { user } = useContext(UserContext) || {}; // Safely get the user from UserContext
  const [userList, setUserList] = useState([]);
  const [chatBoxes, setChatBoxes] = useState({});
  const [showUsers, setShowUsers] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

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
    fetch(`${process.env.REACT_APP_API_URL}/users/alldetails`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user list');
        }
        return response.json();
      })
      .then((data) => {
        setUserList(data);
      })
      .catch((error) => {
        console.error('Error fetching user list:', error);
        toast.error('Failed to fetch user list');
      });
  };

  useEffect(() => {
    if (socket) {
      socket.on('new_message', handleNewMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [socket, user]);

  const handleNewMessage = (newMessage) => {
    console.log('New message received:', newMessage);

    if (newMessage.sender.name === user.name || newMessage.receiver.name === user.name) {
      const relevantUserId = newMessage.sender.name === user.name ? newMessage.receiver._id : newMessage.sender._id;

      setChatBoxes((prevChatBoxes) => {
        const updatedChatBoxes = { ...prevChatBoxes };
        if (updatedChatBoxes[relevantUserId]) {
          updatedChatBoxes[relevantUserId].messages = [
            ...(updatedChatBoxes[relevantUserId].messages || []),
            newMessage,
          ];
        } else {
          // If chat box doesn't exist (for incoming messages), create it
          updatedChatBoxes[relevantUserId] = {
            visible: true,
            messages: [newMessage],
          };
        }
        return updatedChatBoxes;
      });

      if (newMessage.receiver.name === user.name) {
        showNotification(`New message from ${newMessage.sender.name}`);
      } else if (newMessage.sender.name === user.name) {
        showNotification(`Message Sent`);
      }
    }
  };

  const handleNotificationClick = () => {
    navigate('/Messages');
  };

  const handleUserSelect = (selectedUser) => {
    setChatBoxes((prevChatBoxes) => {
      const updatedChatBoxes = { ...prevChatBoxes };
      updatedChatBoxes[selectedUser._id] = {
        visible: true,
        messages: [], // You can initialize with previous messages if needed
      };
      return updatedChatBoxes;
    });

    // Hide user list on mobile
    if (isMobile) {
      setShowUsers(false);
    }
  };

  const handleSendMessage = (recipientId, messageContent) => {
    socket.emit('send_message', { recipientId, content: messageContent });

    setChatBoxes((prevChatBoxes) => {
      const updatedChatBoxes = { ...prevChatBoxes };
      if (updatedChatBoxes[recipientId]) {
        updatedChatBoxes[recipientId].messages = [
          ...(updatedChatBoxes[recipientId].messages || []),
          { content: messageContent, sender: { _id: user._id, name: user.name } },
        ];
      } else {
        updatedChatBoxes[recipientId] = {
          visible: true,
          messages: [{ content: messageContent, sender: { _id: user._id, name: user.name } }],
        };
      }
      return updatedChatBoxes;
    });

    toast.success('Message sent');
  };

  const handleBackClick = () => {
    setShowUsers(true);
    // Hide all chat boxes when going back
    setChatBoxes({});
  };

  return (
    <div className="dashboard-container" style={{ overflow: 'hidden', height: '100vh' }}>
      <ToastContainer />
      <div
        id="Chatroom-container"
        className="d-flex flex-row"
        style={{ height: '100%', maxHeight: '100vh', marginLeft: '15vw', width: '85vw', overflowY: 'hidden' }}
      >
        {!showUsers && isMobile && (
          <div
            className="d-flex align-items-center justify-content-end"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              height: 'fit-content',
              width: '100%',
              padding: '5px',
              position: 'absolute',
              top: '0',
              zIndex: '10',
            }}
          >
            <button
              onClick={handleBackClick}
              style={{ color: 'white', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              &#8592; Back
            </button>
          </div>
        )}
        <div className="user-list-container" style={{ width: '20%', background: '#f0f0f0' }} hidden={!showUsers}>
          <h3 className="ms-5 p-2">User List</h3>
          <UsersLists userList={userList} onSelectUser={handleUserSelect} />
        </div>
        <div
          className="d-flex flex-wrap"
          style={{
            backgroundImage: 'linear-gradient(184.1deg, rgba(249,255,182,1) 44.7%, rgba(226,255,172,1) 67.2%)',
            flex: 1,
            position: 'relative',
          }}
        >
          {userList.map((user) => (
            chatBoxes[user._id]?.visible && (
              <ChatBox
                key={user._id}
                recipient={user}
                visible={chatBoxes[user._id]?.visible}
                setChatBoxes={setChatBoxes}
                messages={chatBoxes[user._id]?.messages || []}
                socket={socket}
                handleSendMessage={handleSendMessage}
              />
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
