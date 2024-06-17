import React, { useState, useEffect } from 'react';
import { useSocket } from '../SocketProvider'; // Import useSocket hook from SocketProvider
import UsersLists from './UsersLists';
import ChatBox from './ChatBox';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../components/Style.css';
import './Chat.css';

const ChatRoom = () => {
  const socket = useSocket(); // Get the socket instance using useSocket hook
  const [userList, setUserList] = useState([]);
  const [chatBoxes, setChatBoxes] = useState({});
  const [showUsers, setShowUsers] = useState(true); // Add state to control the visibility of the user list
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700); // State to track if the device is mobile
  const navigate = useNavigate();

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
        setChatBoxes((prevChatBoxes) => {
          const updatedChatBoxes = { ...prevChatBoxes };
          data.forEach((user) => {
            if (!updatedChatBoxes[user._id]) {
              updatedChatBoxes[user._id] = false;
            }
          });
          return updatedChatBoxes;
        });
      })
      .catch((error) => {
        console.error('Error fetching user list:', error);
        toast.error('Failed to fetch user list');
      });
  };

  useEffect(() => {
    if (socket) {
      // Listen for 'new_message' event using the existing socket instance
      socket.on('new_message', (newMessage) => {
        // Log the newMessage object to debug
        console.log('New message received:', newMessage);

        // Update the messages state for the relevant recipient
        setChatBoxes((prevChatBoxes) => {
          const updatedChatBoxes = { ...prevChatBoxes };
          const recipientId = newMessage.sender._id;
          if (updatedChatBoxes[recipientId]) {
            updatedChatBoxes[recipientId].messages = [
              ...(updatedChatBoxes[recipientId].messages || []),
              newMessage,
            ];
          }
          return updatedChatBoxes;
        });

        // Notify user about the new message
        if (newMessage.sender && newMessage.sender.name) {
          toast.info(`New message from ${newMessage.sender.name}`, {
            onClick: () => handleNotificationClick(),
          });
        } else {
          toast.info('New message received', {
            onClick: () => handleNotificationClick(),
          });
        }
      });

      return () => {
        // Clean up event listener
        socket.off('new_message');
      };
    }
  }, [socket]);

  const handleNotificationClick = () => {
    navigate('/Messages'); // Navigate to /Messages route
  };

  const handleUserSelect = (user) => {
    setChatBoxes((prevChatBoxes) => ({
      ...prevChatBoxes,
      [user._id]: {
        visible: !prevChatBoxes[user._id]?.visible,
        messages: prevChatBoxes[user._id]?.messages || [],
      },
    }));
    if (isMobile) {
      setShowUsers(false); // Hide user list when a user is selected on mobile
    }
  };

  const handleSendMessage = (recipientId, messageContent) => {
    socket.emit('send_message', { recipientId, content: messageContent });
    toast.success('Message sent');

    // Add the sent message to the messages state
    setChatBoxes((prevChatBoxes) => {
      const updatedChatBoxes = { ...prevChatBoxes };
      if (updatedChatBoxes[recipientId]) {
        updatedChatBoxes[recipientId].messages = [
          ...(updatedChatBoxes[recipientId].messages || []),
          { content: messageContent, sender: { id: 'self' } }, // 'self' indicates the sender is the current user
        ];
      }
      return updatedChatBoxes;
    });
  };

  const handleBackClick = () => {
    setShowUsers(true); // Show user list on back button click
    setChatBoxes({}); // Hide all chat boxes
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
            <ChatBox
              key={user._id}
              recipient={chatBoxes[user._id] ? user : null}
              visible={chatBoxes[user._id]?.visible}
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