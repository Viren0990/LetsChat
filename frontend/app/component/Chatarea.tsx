"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
}

interface Friend {
  id: number;
  username: string;
  avatar?: string;
  status: 'online' | 'offline';
}

export function Component({ friend }: { friend: Friend }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:3000/api/v1/friends/messages/${friend.id}`,
          {
            headers: { Authorization: token },
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [friend.id]);

  useEffect(() => {
    const socket = io('http://localhost:4000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socket.on('messageReceived', (data: { senderId: number; content: string; createdAt: string }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          senderId: data.senderId,
          receiverId: friend.id,
          content: data.content,
          createdAt: data.createdAt,
        },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [friend.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '') {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'http://localhost:3000/api/v1/friends/send-message',
          {
            receiverId: friend.id,
            content: inputMessage.trim(),
          },
          {
            headers: { Authorization: token },
          }
        );

        const newMessage = response.data.message;
        setMessages([...messages, newMessage]);
        setInputMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-screen w-full mx-auto bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="p-4 bg-gray-900 border-b border-gray-700 mb-2 flex items-center space-x-4"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={`w-3 h-3 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        <h2 className="text-xl font-semibold">{friend.username}</h2>
        <span className="text-sm text-gray-400">{friend.status}</span>
      </motion.div>
      
      <motion.div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${
                message.senderId === friend.id ? 'justify-start' : 'justify-end'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg shadow-md ${
                  message.senderId === friend.id
                    ? 'bg-gray-700 text-gray-100'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </motion.div>
      <motion.div 
        className="p-4 bg-gray-900 border-t border-gray-700"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
          />
          <motion.button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}