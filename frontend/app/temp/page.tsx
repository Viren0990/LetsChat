'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../component/SIdebar';
import { Component as ChatArea } from '../component/Chatarea';

interface Friend {
  id: number;
  username: string;
  avatar?: string;
  status: 'online' | 'offline';
}

const Page = () => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const handleFriendSelect = (friend: Friend) => {
    setSelectedFriend(friend);
  };

  return (
    <motion.div 
      className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-1/4 border-r border-gray-200 dark:border-gray-700"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Sidebar onFriendSelect={handleFriendSelect} />
      </motion.div>
      <motion.div 
        className="flex-1 flex flex-col"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <AnimatePresence mode="wait">
          {selectedFriend ? (
            <motion.div
              key="chat-area"
              className="flex-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <ChatArea friend={selectedFriend} />
            </motion.div>
          ) : (
            <motion.div
              key="no-selection"
              className="flex justify-center items-center h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-gray-400 text-xl font-semibold">Select a friend to start chatting</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Page;