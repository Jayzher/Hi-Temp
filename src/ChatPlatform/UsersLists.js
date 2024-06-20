import React, { useState, useEffect } from 'react';
import './Chat.css';
import { useSocket } from '../SocketProvider';

const UsersLists = ({ userList, onSelectUser }) => {
  const [chatList, setChatList] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    setChatList(userList);
  }, [userList]);

  useEffect(() => {
    if (socket) {
      const StatusChange = (statusChange) => {
        setChatList((prevChatList) => {
          return prevChatList.map((user) => {
            if (statusChange.userId === user._id) {
              return { ...user, Status: statusChange.status };
            }
            return user;
          });
        });
      };

      socket.on('userStatusChange', StatusChange);

      return () => {
        socket.off('userStatusChange', StatusChange);
      };
    }
  }, [socket]);

  return (
    <div>
      <ul className="user-list">
        {chatList.map((user) => (
          <li className={user.Status ? 'Online' : 'Offline'} key={user._id} onClick={() => onSelectUser(user)}>
            <p style={{ fontSize: '0.8rem', marginRight: '20px' }}>{user.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersLists;
