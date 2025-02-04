// app/profile/UserProfileModal.tsx
import React from "react";
import moment from "moment";

interface User {
  userId: number;
  username: string;
  name: string;
  email: string;
  profilePicture: string;
  bio: string;
}

interface Trip {
  tripId: number;
  location: string;
  startDate: string;
  endDate: string;
}

interface Post {
  postId: number;
  caption: string;
  image: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: {
    user: User;
    trips: Trip[];
    posts: Post[];
  };
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, userProfile }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{userProfile.user.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div className="flex items-center mb-4">
          <img
            src={userProfile.user.profilePicture || "/images/null_avatar.png"}
            alt="Profile"
            className="w-16 h-16 rounded-full mr-4"
          />
          <div>
            <p className="text-gray-700">@{userProfile.user.username}</p>
            <p className="text-gray-500">{userProfile.user.bio}</p>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold">Trips</h3>
          <ul>
            {userProfile.trips.map((trip) => (
              <li key={trip.tripId} className="text-gray-700">
                {trip.location} - {moment(trip.startDate).format("MMM D, YYYY")} to {moment(trip.endDate).format("MMM D, YYYY")}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Posts</h3>
          <ul>
            {userProfile.posts.map((post) => (
              <li key={post.postId} className="text-gray-700">
                <img src={post.image} alt="Post" className="w-24 h-24 object-cover" />
                <p>{post.caption}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;