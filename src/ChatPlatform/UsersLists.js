import React from 'react';
import './Chat.css';

const UsersLists = ({ userList, onSelectUser }) => {
  return (
    <div>
      <ul className="user-list">
        {userList.map((user) => (
          <li className={(user.Status) ? 'Online' : 'Offline'} key={user._id} onClick={() => onSelectUser(user)}>
            <p style={{fontSize: "0.8rem", marginRight: "20px"}}>{user.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersLists;