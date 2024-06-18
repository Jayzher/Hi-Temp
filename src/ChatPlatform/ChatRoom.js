import React, { useState, useEffect, useContext } from 'react';
import { useSocket } from '../SocketProvider';
import UsersLists from './UsersLists';
import ChatBox from './ChatBox';
import { useNavigate } from 'react-router-dom';
import '../components/Style.css';
import './Chat.css';
import UserContext from '../userContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChatRoom = () => {
  const socket = useSocket();
  const [userList, setUserList] = useState([]);
  const [chatBoxes, setChatBoxes] = useState({});
  const [showUsers, setShowUsers] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

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
    let retryCount = 0;
    const fetchData = () => {
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
          if (retryCount < 3) {
            retryCount++;
            setTimeout(fetchData, 1000); // Retry after 1 second
          }
        });
    };
    fetchData();
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

  const handleUserSelect = (selectedUser) => {
    setChatBoxes((prevChatBoxes) => ({
      ...prevChatBoxes,
      [selectedUser._id]: {
        ...prevChatBoxes[selectedUser._id],
        visible: true,
      },
    }));
    if (isMobile) {
      setShowUsers(false);
    }
  };

  const handleSendMessage = (recipientId, messageContent) => {
    const message = { recipientId, content: messageContent };
    socket.emit('send_message', message);
    toast.success('Sent Successfully!');
  };

  const handleBackClick = () => {
    setShowUsers(true);
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
        <div className="chatboxes-container d-flex flex-wrap" style={{ backgroundImage: 'linear-gradient(184.1deg, rgba(249,255,182,1) 44.7%, rgba(226,255,172,1) 67.2%)', flex: 1, position: 'relative' }}>
          {userList.map((user) => {
            const chatBox = chatBoxes[user._id];
            return (
              <ChatBox
                key={user._id}
                recipient={chatBox?.visible ? user : null}
                visible={chatBox?.visible}
                setChatBoxes={setChatBoxes}
                messages={chatBox?.messages || []}
                handleSendMessage={handleSendMessage}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
