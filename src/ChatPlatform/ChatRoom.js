import React, { useState, useEffect } from 'react';
import { useSocket } from '../SocketProvider'; // Import useSocket hook from SocketProvider
import UsersLists from './UsersLists';
import ChatBox from './ChatBox';
import Notification from './Notification'; // Import Notification component
import '../components/Style.css';
import './Chat.css';

const ChatRoom = () => {
  const socket = useSocket(); // Get the socket instance using useSocket hook
  const [userList, setUserList] = useState([]);
  const [chatBoxes, setChatBoxes] = useState({});
  const [showUsers, setShowUsers] = useState(true); // Add state to control the visibility of the user list
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700); // State to track if the device is mobile
  const [newMessage, setNewMessage] = useState(null); // State to store new message content
  const [showNotification, setShowNotification] = useState(false); // State to control notification visibility

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
      .catch((error) => console.error('Error fetching user list:', error));
  };

  useEffect(() => {
    if (socket) {
      // Listen for 'new_message' event using the existing socket instance
      socket.on('new_message', (newMessage) => {
        // Update messages for the recipient in chatBoxes state
        setChatBoxes((prevChatBoxes) => ({
          ...prevChatBoxes,
          [newMessage.recipientId]: true,
        }));

        // Set new message and show notification
        setNewMessage(newMessage.content);
        setShowNotification(true);
      });

      return () => {
        // Clean up event listener
        socket.off('new_message');
      };
    }
  }, [socket]);

  const handleUserSelect = (user) => {
    setChatBoxes((prevChatBoxes) => ({
      ...prevChatBoxes,
      [user._id]: !prevChatBoxes[user._id],
    }));
    if (isMobile) {
      setShowUsers(false); // Hide user list when a user is selected on mobile
    }
  };

  const handleSendMessage = (recipientId, messageContent) => {
    socket.emit('send_message', { recipientId, content: messageContent });
  };

  const handleBackClick = () => {
    setShowUsers(true); // Show user list on back button click
    setChatBoxes({}); // Hide all chat boxes
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNewMessage(null);
  };

  return (
    <div className="dashboard-container" style={{ overflow: "hidden", height: '100vh' }}>
      <div id="Chatroom-container" className="d-flex flex-row" style={{ height: '100%', maxHeight: '100vh', marginLeft: "15vw", width: '85vw', overflowY: "hidden" }}>
        <div className="d-flex flex-wrap" style={{ backgroundImage: "linear-gradient(184.1deg, rgba(249,255,182,1) 44.7%, rgba(226,255,172,1) 67.2%)", flex: 1, position: 'relative' }}>
          {!showUsers && isMobile && (
            <div className="d-flex align-items-center justify-content-end" style={{ background: "rgba(0, 0, 0, 0.7)", height: "fit-content", width: "100%", padding: "5px", position: 'absolute', top: '0', zIndex: "10"}}>
              <button onClick={handleBackClick} style={{ color: 'white', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                &#8592; Back
              </button>
            </div>
          )}
          <div className="user-list-container" style={{ width: '20%', background: '#f0f0f0'}} hidden={!showUsers} >
            <h3 className="ms-5 p-2">User List</h3>
            <UsersLists userList={userList} onSelectUser={handleUserSelect} />
          </div>
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
      <Notification
        message={newMessage}
        show={showNotification}
        handleClose={handleCloseNotification}
      />
    </div>
  );
};

export default ChatRoom;
