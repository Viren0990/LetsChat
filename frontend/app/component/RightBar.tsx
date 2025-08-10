import { useEffect, useState } from "react";
import axios from "axios";

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

export const Rightbar = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);

  const acceptFriendRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/v1/friends/friend-request/accept',
        { requestId },
        {
          headers: { authorization: token }
        }
      );

      const acceptedFriend: Friend = response.data.friend; // Assuming the response includes the accepted friend
      setFriendRequests(friendRequests.filter(req => req.id !== requestId)); // Remove request
      setFriends(prevFriends => [...prevFriends, acceptedFriend]); // Add to friends list
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

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

  return (
    <div>
      <div className="w-60 bg-gray-900 p-4 h-full">
        <h1 className="text-white text-2xl font-bold mb-4 mt-1 ml-4">Friend Requests</h1>
        <div className="bg-white h-0.5"></div>
        <ul className="h-80 overflow-y-auto py-4 mt-2">
          {friendRequests.length > 0 ? (
            friendRequests.map((req) => (
              <li key={req.id} className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold font-xl">{req.user.username}</span>
                <button
                  onClick={() => acceptFriendRequest(req.id)}
                  className="bg-green-500 text-white px-2 py-1 rounded">
                  Accept
                </button>
              </li>
            ))
          ) : (
            <p className="text-white mt-6 ml-4">No new friend requests</p>
          )}
        </ul>

       
      </div>
    </div>
  );
};
