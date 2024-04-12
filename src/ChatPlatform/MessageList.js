import React from 'react';

const MessageList = ({ messages }) => {
  return (
    <div className="messages">
      {messages.map((msg, index) => (
        <div key={index} className={msg.sender === 'You' ? 'sent' : 'received'}>
          <p>{msg.content}</p>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
