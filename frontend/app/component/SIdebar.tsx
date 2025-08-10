'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Friend {
  id: number;
  username: string;
  avatar?: string;
  status: 'online' | 'offline';
}

interface SidebarProps {
  onFriendSelect: (friend: Friend) => void;
}

export function Sidebar({ onFriendSelect }: SidebarProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/friends/friends', {
          headers: { authorization: token },
        });
        setFriends(response.data);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, []);

  const handleFriendSelect = (friend: Friend) => {
    setSelectedFriend(friend);
    onFriendSelect(friend); // Pass the selected friend to the parent component
  };

  return (
    <div className="p-4 first-line:w-64 bg-gray-900  h-screen flex flex-col">
      <h1 className="pl-4 pr-4 text-3xl font-bold mb-5 text-white flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        LetsChat
      </h1>
      <div className="bg-white h-0.5 p-0"></div>
      
      <h2 className="text-xl font-semibold mb-4 text-white mt-4">Friends</h2>
      <ul className="flex-grow overflow-y-auto space-y-2 ">
        {friends.map((friend) => (
          <li key={friend.id}>
            <button
              className={`flex items-center w-full p-2 rounded-lg transition-colors duration-200 ${
                selectedFriend?.id === friend.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => handleFriendSelect(friend)}
            >
              <div className="relative h-8 w-8 mr-2">
                <img
                  src={friend.avatar || '/placeholder.svg?height=32&width=32'}
                  alt={friend.username}
                  className="rounded-full"
                />
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 ${
                    friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                ></span>
              </div>
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium">{friend.username}</p>
                <p
                  className={`text-xs ${
                    friend.status === 'online' ? 'text-green-400' : 'text-gray-400'
                  }`}
                >
                  {friend.status}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
