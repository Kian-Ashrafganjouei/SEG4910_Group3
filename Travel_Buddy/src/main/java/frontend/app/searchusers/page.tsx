"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../layout/navbar/page";
import Footer from "../layout/footer/page";

interface User {
  userId: number;
  username: string;
  name: string;
  profilePicture: string;
}

export default function Profile() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/backend/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data: User[] = await response.json();
        setUsers(data);
        setFilteredUsers(data); // Show all users initially
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, users]);

  const handleUserClick = (userId: number) => {
    console.log("Navigating to profile of user:", userId);
    router.push(`/profileview/${userId}`);
  };

  return (
    <div className="mt-16">
      <Navbar />
      <div className="flex flex-col items-center">
        <div className="profile-container w-11/12 p-8 m-8 bg-gradient-to-br from-purple-500 to-indigo-700 rounded-3xl shadow-2xl text-white">
          <h1 className="text-center text-4xl font-bold mb-8">Search Users</h1>

          <input
            type="text"
            placeholder="Search user profiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4 bg-white text-black"
          />

          {filteredUsers.length > 0 ? (
            <ul className="bg-white text-black rounded-lg shadow-md p-2 max-h-48 overflow-auto">
              {filteredUsers.map((user) => (
                <li
                  key={user.userId}
                  className="flex items-center p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleUserClick(user.userId)}
                >
                  <img
                    className="w-10 h-10 rounded-full mr-3"
                    src={user.profilePicture || "/images/null_avatar.png"}
                    alt={user.username}
                  />
                  <span className="text-lg font-medium">@{user.username}</span>
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && (
              <p className="text-center text-lg text-white">No users found.</p>
            )
          )}

          {isLoading && (
            <p className="text-center text-xl font-semibold">Loading users...</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
