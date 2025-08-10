'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios';
import { useRouter } from 'next/navigation'

interface User {
  id: number;
  username: string;
  avatar?: string;
}

interface Friend {
  id: number;
  user: User;
  status: 'online' | 'offline';
}

interface Result {
  id: number,
  username: string,
  email: string,
  password: string,
  createdAt: Date,
  updatedAt: Date,
  friendshipStatus: 'accepted' | 'pending' | 'not friends'; 
}

export default function Component() {
  const router = useRouter()
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<Result[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/v1/friends/search/${searchQuery}`, {
        headers: { authorization: token }
      });
      setSearchResult(response.data);
      setShowSearchResults(true);
      console.log('Search result:', response.data);
    } catch (error) {
      console.error('Error searching:', error);
    }
  }

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/v1/friends/friends', {
        headers: { authorization: token }
      });
      setFriends(response.data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/v1/friends/friend-requests', {
          headers: { authorization: token }
        });
        setFriendRequests(response.data);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };
    fetchFriendRequests();
    fetchFriends();
  }, []);

  const handleAcceptRequest = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/v1/friends/friend-request/accept',
        { requestId: id },
        {
          headers: { authorization: token }
        }
      );

      const acceptedFriend: Friend = response.data.friend;
      setFriends((prev) => [...prev, acceptedFriend]);
      setFriendRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const sendFriendRequest = async (friendId:number) => {
  
    try {
        // Retrieve the token from localStorage (assumes you are storing the JWT token there)
        const token = localStorage.getItem('token');

        // Send the POST request to your backend
        const response = await axios.post('http://localhost:3000/api/v1/friends/friend-request', 
            { friendId }, 
            {
                headers: {
                    authorization: localStorage.getItem("token")
                }
            }
        );

    } catch (error: any) {
        console.error('Error sending friend request:', error);
        }
    }

  const handleSignOut = () => {
    console.log('Signing out');
    localStorage.removeItem('token');
    router.push('/signin');
  }

  const handleChatNow = () => {
    console.log('Opening chat');
    router.push('/temp');
  }

  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
  }

  

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="p-4 bg-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <motion.h1
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            LetsChat
          </motion.h1>
          <motion.button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm bg-transparent hover:bg-gray-700 rounded-full transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Sign Out
          </motion.button>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <motion.div
          className="max-w-2xl mx-auto mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-4 mt-4">Connect with Friends Instantly</h2>
          <p className="text-xl mb-8">Start chatting with your friends right now!</p>
          <motion.button
            onClick={handleChatNow}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 text-xl rounded-full transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Chat Now
          </motion.button>
        </motion.div>
        <motion.div
          className="max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <form onSubmit={handleSearch} className="flex">
            <input
              type="search"
              placeholder="Search for friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow px-6 py-4 bg-gray-800 text-white rounded-l-full focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-r-full transition-colors duration-200"
            >
              Search
            </button>
          </form>
        </motion.div>
        <AnimatePresence>
        {showSearchResults && (
          <motion.div
            className="max-w-md mx-auto mb-8 bg-gray-800 rounded-lg p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Search Results</h3>
              <button
                onClick={handleCloseSearchResults}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {searchResult.length > 0 ? (
              <ul className="space-y-2">
                {searchResult.map((user) => (
                  <li key={user.id} className="flex items-center justify-between">
                    <span>{user.username}</span>
                    {user.friendshipStatus === 'accepted' ? (
                      <span className="text-green-500">Friends</span>
                    ) : user.friendshipStatus === 'pending' ? (
                      <span className="text-yellow-500">Pending Request</span>
                    ) : (
                      <button
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-full text-sm"
                        onClick={() => sendFriendRequest(user.id)}  // Wrap the async function in an anonymous function
                      >
                        Add Friend
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-400">No users found</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold m-4">Friend Requests</h2>
          {friendRequests.length > 0 ? (
            friendRequests.map((request, index) => (
              <motion.div
                key={request.id}
                className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 0 8px rgba(0, 255, 0, 0.3)',
                  transition: { duration: 0.2 }
                }}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={request.user.avatar || '/default-avatar.png'}
                    alt={request.user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <span>{request.user.username}</span>
                </div>
                <motion.button
                  onClick={() => handleAcceptRequest(request.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Accept Request
                </motion.button>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center p-8 bg-gray-800 rounded-lg m-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-lg text-gray-400 mt-10">No friend requests at the moment.</p>
              <p className="text-sm text-gray-500 mt-2 mb-10">Why not search for some new friends?</p>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}