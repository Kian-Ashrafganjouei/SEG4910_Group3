"use client";

import Navbar from "../../layout/navbar/page";
import Footer from "../../layout/footer/page";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface Post {
  postId: number;
  caption: string;
  image: string;
  createdAt: string;
  userTrip?: {
    user: {
      userId: number;
      username: string;
      name: string;
      profilePicture: string;
    };
    trip: {
      location: string;
    };
  };
}

interface User {
  userId: number;
  username: string;
  name: string;
}

interface UserTrip {
  userTripId: number;
  status: string; // "requested", "joined", or "declined"
  trip: {
    tripId: number;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  };
}

export default function Profile() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userTrips, setUserTrips] = useState<UserTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [selectedUserTripId, setSelectedUserTripId] = useState<number | null>(
    null
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/backend/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts.");
      }

      const data: Post[] = await response.json();
      setPosts(data);
      setFilteredPosts(data);
      setErrorMessage(data.length === 0 ? "No posts available." : null);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setErrorMessage("An error occurred while fetching posts.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/backend/users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserTrips = async () => {
    if (!session?.user?.email) return;
    try {
      const response = await fetch(
        `/backend/user-trips?email=${session.user.email}`
      );
      if (!response.ok) throw new Error("Failed to fetch user trips");

      const data: UserTrip[] = await response.json();
      setUserTrips(data);
    } catch (error) {
      console.error("Error fetching user trips:", error);
    }
  };

  const handleAddPost = async () => {
    if (!newImage || !newCaption || !selectedUserTripId) {
      alert("Please provide a caption, image, and select a trip.");
      return;
    }

    const formData = new FormData();
    formData.append("caption", newCaption);
    formData.append("image", newImage);
    formData.append("userTripId", String(selectedUserTripId));

    try {
      const response = await fetch("/backend/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add post.");
      }

      alert("Post added successfully!");
      setNewCaption("");
      setNewImage(null);
      setSelectedUserTripId(null);
      setIsModalOpen(false);
      fetchPosts(); // Refresh posts after adding
    } catch (error) {
      console.error("Error adding post:", error);
      alert("An error occurred while adding the post.");
    }
  };

  const handleFilterPosts = () => {
    if (!selectedUserId) {
      setFilteredPosts(posts);
      return;
    }

    const userPosts = posts.filter(
      (post) => post.userTrip?.user.userId === selectedUserId
    );

    if (userPosts.length === 0) {
      setErrorMessage("No posts found for the selected user.");
    } else {
      setErrorMessage(null);
    }

    setFilteredPosts(userPosts);
  };

  useEffect(() => {
    fetchPosts();
    fetchUsers();
    fetchUserTrips();
  }, [session]);

  return (
    <div className="mt-16">
      <Navbar />
      <div className="flex flex-col items-center">
        <div className="profile-container w-11/12 p-8 m-8 bg-gradient-to-br from-purple-500 to-indigo-700 rounded-3xl shadow-2xl text-white">
          <h1 className="title text-center text-4xl font-bold mb-8">
            {session?.user?.username || "User"}'s Posts
          </h1>

          <label className="block mb-4">
            Filter by User:
            <select
              value={selectedUserId || ""}
              onChange={(e) =>
                setSelectedUserId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full p-2 border rounded-lg mt-1 bg-white text-black"
            >
              <option value="">Show all posts</option>
              {users.map((user) => (
                <option key={user.userId} value={user.userId} className="text-black">
                  {user.name} ({user.username})
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={handleFilterPosts}
            className="mb-8 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          >
            Apply Filter
          </button>

          {isLoading ? (
            <p className="loading-msg text-center text-xl font-semibold">
              Loading posts...
            </p>
          ) : errorMessage ? (
            <p className="error-msg text-center text-xl text-red-300">
              {errorMessage}
            </p>
          ) : filteredPosts.length > 0 ? (
            <div className="posts-list space-y-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.postId}
                  className="post-card flex flex-col items-start p-6 rounded-xl shadow-lg bg-white text-black relative"
                >
                  {/* Display Profile Picture and Username */}
                  <div className="flex items-center mb-4">
                    <img
                      className="w-10 h-10 rounded-full mr-3"
                      src={
                        post.userTrip?.user?.profilePicture
                          ? post.userTrip.user.profilePicture
                          : "/images/null_avatar.png"
                      }
                      alt={post.userTrip?.user?.username || "User Avatar"}
                    />
                    <span className="text-lg font-medium text-gray-700">
                      @{post.userTrip?.user?.username || "Unknown"}
                    </span>
                  </div>

                  {/* Display Trip Location */}
                  {post.userTrip?.trip?.location && (
                    <span className="absolute top-4 right-4 text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                      {post.userTrip.trip.location}
                    </span>
                  )}

                  {/* Post Content */}
                  <img
                    src={post.image}
                    alt={post.caption}
                    className="post-image w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <p className="post-caption text-lg text-gray-700 mb-2">
                    {post.caption}
                  </p>
                  <p className="post-date text-sm text-gray-500">
                    Posted on {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-posts-msg text-center text-xl">No posts found.</p>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700"
          >
            Add Post
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white p-8 rounded-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">Add a New Post</h2>
            <label className="block mb-4">
              Caption:
              <input
                type="text"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                className="w-full p-2 border rounded-lg mt-1"
              />
            </label>
            <label className="block mb-4">
              Image:
              <input
                type="file"
                onChange={(e) =>
                  setNewImage(e.target.files ? e.target.files[0] : null)
                }
                className="w-full p-2 border rounded-lg mt-1"
              />
            </label>
            <label className="block mb-4">
              Select a Trip:
              <select
                value={selectedUserTripId || ""}
                onChange={(e) =>
                  setSelectedUserTripId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full p-2 border rounded-lg mt-1"
              >
                <option value="">Select a trip</option>
                {userTrips.map((userTrip) => (
                  <option
                    key={userTrip.userTripId}
                    value={userTrip.userTripId}
                  >
                    {userTrip.trip?.location} ({userTrip.trip?.startDate})
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPost}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
              >
                Add Post
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
