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
    <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`mb-4 p-3 rounded-lg ${
            message.user === 'admin' ? 'bg-gray-200 text-gray-500 italic' : 'bg-purple-100 text-gray-900'
}`}
        >
          <span className="font-bold text-purple-600">{message.user  || 'Unknown'}: </span>
          <span>{message.text || '[No message]'}</span>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
