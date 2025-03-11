"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface UserProfile {
  userId: number;
  username: string;
  profilePicture: string;
  name: string;
  bio: string;
  postsCount: number;
  reviewsCount: number;
}

export default function ProfileView() {
  const router = useRouter();
  const { userId } = useParams(); // Get the userId from the URL params
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/backend/user/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user profile");
        const data: UserProfile = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!userProfile) {
    return <div className="flex justify-center items-center h-screen">User not found</div>;
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-screen text-white bg-black p-6">
      <button
        onClick={() => router.push("/my-trips")}
        className="absolute top-4 left-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        ← Back to My Trips
      </button>
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold mb-4">@{userProfile.username}</h1>
        <img
          className="w-24 h-24 rounded-full border-2 border-gray-500 mb-4"
          src={userProfile.profilePicture || "/images/null_avatar.png"}
          alt={userProfile.username}
        />
        <div className="flex space-x-8 mb-4">
          <div>
            <span className="text-lg font-semibold">{userProfile.postsCount}</span>
            <p className="text-sm text-gray-400">Posts</p>
          </div>
          <div>
            <span className="text-lg font-semibold">{userProfile.reviewsCount}</span>
            <p className="text-sm text-gray-400">Reviews</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold">{userProfile.name}</h2>
        {userProfile.bio && <p className="text-sm text-gray-400 mt-2">{userProfile.bio}</p>}
      </div>
    </div>
  );
}
