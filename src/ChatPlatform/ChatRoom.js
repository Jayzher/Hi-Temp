import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import UsersLists from './UsersLists';
import ChatBox from './ChatBox';
import '../components/comp.css';
import './Chat.css';

const ChatRoom = () => {
  const [socket, setSocket] = useState(null);
  const [userList, setUserList] = useState([]);
  const [chatBoxes, setChatBoxes] = useState({});

  useEffect(() => {
    const newSocket = io('http://localhost:4000');

    newSocket.on('connect', () => {
      console.log('WebSocket connection established');
    });

    setSocket(newSocket);

    fetchUserList();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchUserList = () => {
    fetch('http://localhost:4000/users/alldetails')
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
      const newUser = io('http://localhost:4000');

      newUser.on('userStatusChange', (data) => {
        console.log('New user added:', data);
        // Add the new user to the userList state
        setUserList((prevUserList) => [...prevUserList, data]);
      });

      newUser.on('userStatusChange', (data) => {
        // Add the new user to the userList state
        fetchUserList();
      });

      return () => {
        newUser.disconnect();
      };

  }, [socket]);

  const handleUserSelect = (user) => {
    setChatBoxes((prevChatBoxes) => ({
      ...prevChatBoxes,
      [user._id]: !prevChatBoxes[user._id], // Toggle visibility
    }));
  };

  const handleSendMessage = (recipientId, messageContent) => {
    // Send message to the server using socket
    socket.emit('send_message', { recipientId, content: messageContent });
  };

  return (
    <div className="dashboard-container" style={{ overflow: "hidden", height: '100vh' }}>
      <div className="d-flex flex-row" style={{ height: '100vh', maxHeight: '100vh', marginLeft: "15vw", width: '85vw', overflowY: "hidden" }}>
        <div className="user-list-container" style={{ width: '20%', background: '#f0f0f0' }}>
          <h3 className="ms-5">User List</h3>
          <UsersLists userList={userList} onSelectUser={handleUserSelect} />
        </div>
        <div className="d-flex flex-wrap" style={{ backgroundImage: "linear-gradient( 184.1deg,  rgba(249,255,182,1) 44.7%, rgba(226,255,172,1) 67.2% )", flex: 1 }}>
          {userList.map((user) => (
            <ChatBox
              key={user._id}
              recipient={chatBoxes[user._id] ? user : null}
              visible={!!chatBoxes[user._id]} // Use !! to convert truthy/falsy value to boolean
              setChatBoxes={setChatBoxes} // Pass the setChatBoxes function as a prop
              socket={socket} // Pass the socket instance as a prop
              handleSendMessage={handleSendMessage} // Pass the handleSendMessage function as a prop
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
