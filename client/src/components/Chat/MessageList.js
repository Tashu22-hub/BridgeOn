// src/components/Chat/MessageList.js
import React, { useRef, useEffect } from 'react';

export const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`mb-4 ${
            message.user === 'admin' ? 'text-gray-500 italic' : ''
          }`}
        >
          <span className="font-bold">{message.user  || 'Unknown'}: </span>
          <span>{message.text || '[No message]'}</span>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};