// ChatRoom.js
import React, { useState, useEffect } from 'react';
import { useSocket } from '../SocketProvider'; // Import useSocket hook from SocketProvider
import UsersLists from './UsersLists';
import ChatBox from './ChatBox';
import '../components/Style.css';
import './Chat.css';

const ChatRoom = () => {
  const socket = useSocket(); // Get the socket instance using useSocket hook
  const [userList, setUserList] = useState([]);
  const [chatBoxes, setChatBoxes] = useState({});

  useEffect(() => {
    fetchUserList();

    return () => {
      // Cleanup logic if needed
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
          // Listen for 'userStatusChange' event using the existing socket instance
          socket.on('userStatusChange', (data) => {
              console.log('User status changed:', data);
              fetchUserList(); // Fetch updated user list when status changes
          });

          return () => {
              // Clean up event listener
              socket.off('userStatusChange');
          };
      }
  }, [socket]);

  const handleUserSelect = (user) => {
    setChatBoxes((prevChatBoxes) => ({
      ...prevChatBoxes,
      [user._id]: !prevChatBoxes[user._id],
    }));
  };

  const handleSendMessage = (recipientId, messageContent) => {
    socket.emit('send_message', { recipientId, content: messageContent });
  };

  return (
    <div className="dashboard-container" style={{ overflow: "hidden", height: '100%' }}>
      <div id="Chatroom-container" className="d-flex flex-row" style={{ height: '100%', maxHeight: '100vh', marginLeft: "15vw", width: '85vw', overflowY: "hidden" }}>
        <div className="user-list-container" style={{ width: '20%', background: '#f0f0f0' }}>
          <h3 className="ms-5 p-2">User List</h3>
          <UsersLists userList={userList} onSelectUser={handleUserSelect} />
        </div>
        <div className="d-flex flex-wrap" style={{ backgroundImage: "linear-gradient( 184.1deg,  rgba(249,255,182,1) 44.7%, rgba(226,255,172,1) 67.2% )", flex: 1 }}>
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
