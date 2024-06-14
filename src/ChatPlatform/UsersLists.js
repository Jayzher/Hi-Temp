// src/components/UsersLists.js
import React from 'react';
import './Chat.css';

const UsersLists = ({ userList, onSelectUser, chatBoxes }) => {
  return (
    <div>
      <ul className="user-list">
        {userList.map((user) => (
          <li
            className={`${user.Status ? 'Online' : 'Offline'} ${chatBoxes[user._id]?.unread ? 'Unread' : ''}`}
            key={user._id}
            onClick={() => onSelectUser(user)}
          >
            <p style={{ fontSize: '0.8rem', marginRight: '20px' }}>{user.name}</p>
            {chatBoxes[user._id]?.unread && <span className="unread-indicator">•</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersLists;
