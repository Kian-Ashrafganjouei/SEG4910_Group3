"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../layout/navbar/page";
import Footer from "../layout/footer/page";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";

// Updated User Interface
interface UserProfile {
  userId: number;
  username: string;
  name: string;
  profilePicture: string | null;
  age?: number;
  sex?: string;
  nationality?: string;
  languages?: string[];
  interests?: string[];
  reviewScore: number;
}

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

// interface Post {
//   postId: number;
//   usertripId: number | null;
//   caption: string;
//   image: string;
//   createdAt: string;
// }

interface Review {
  post: Post;
  reviewer?:{
    userId: number;
  }  
  rating: number;
  comment: string;
}

export default function SearchUsers() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchReviews();
  }, [session]);

  useEffect(() => {

    const setUserReviewScores = async () => { // Updates the reviewScores of the users pre-populated in the database (calculates the average of their pre-populated ratings).
                                              // This function will not be needed in a production version, as there will be no (pre-populated) dummy data, 
                                              //    and reviewScores are re-calculated every time someone leaves a review.
      for (let i = 0; i < users.length; i++) {
        let user = users[i];
  
        if (user !== undefined) {
  
          const userPostIds = posts
            .filter((post) => post.userTrip?.user.userId === user.userId)
            .map((post) => post.postId);
  
          let userRatingsSum = 0;
          let count = 0;
  
          for (let i = 0; i<reviews.length; i++) {
            if (userPostIds.includes(reviews[i].post.postId)) {
              userRatingsSum += reviews[i].rating;
              count++;
            }
          }
  
          user.reviewScore = count > 0 
                                  ? Math.round(userRatingsSum / count) //average of all ratings of all of user's posts
                                  : 0; 
  
          const userResponse = await fetch('/backend/user', {
            method: "PUT",
            headers: {"Content-Type": "application/json", 
              Id: user.userId.toString()
            },
            body: JSON.stringify(user)
          });            
        } 
      }
    }

    setUserReviewScores();
    
  }, [posts, reviews]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/backend/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data: UserProfile[] = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } 
      catch (error) {
        console.error("Error fetching users:", error);
      } 
      finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/backend/reviews");
      if (!response.ok) throw new Error("Failed to fetch reviews");

      const data: Review[] = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

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
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async (userId: number) => {
    try {
      const response = await fetch(`/backend/posts/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user posts");
      const data: Post[] = await response.json();
      console.log(data);
      setUserPosts(data);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const renderStars = (rating: number) => {
    const emptyStars = 5 - rating; 
    const stars = [];

    for (let i = 0; i < rating; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} className="text-yellow-500" />);
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="text-gray-400" />);
    }

    return stars;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
    <Navbar />
    <div className="flex-grow flex flex-col items-center pt-24 pb-10">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-xl p-6 mx-4">
        {selectedUser && (
          <button
            onClick={() => {
              setSelectedUser(null);
              setUserPosts([]);
            }}
            className="text-blue-500 hover:underline text-sm mb-4"
          >
            ← Back to Search
          </button>
        )}

        {selectedUser ? (
          <div className="text-left">
            <div className="flex items-start space-x-6">
              {/* Profile Picture */}
              <img
                className="w-28 h-28 rounded-full border border-gray-300"
                src={selectedUser.profilePicture || "/images/null_avatar.png"}
                alt={selectedUser.username}
              />

              {/* User Info - Takes up remaining space */}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold">@{selectedUser.username}</h2>
                    <p className="text-gray-700 text-lg">{selectedUser.name}</p>
                  </div>
                  
                  {/* Star Rating */}
                  <div className="rating text-xl">
                    {selectedUser.reviewScore > 0 ? renderStars(selectedUser.reviewScore) : "No ratings yet"}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-gray-700">
                  {selectedUser.age && <p><strong>Age:</strong> {selectedUser.age}</p>}
                  {selectedUser.sex && <p><strong>Sex:</strong> {selectedUser.sex}</p>}
                  {selectedUser.nationality && <p><strong>Nationality:</strong> {selectedUser.nationality}</p>}
                  {selectedUser.languages !== undefined && selectedUser.languages.length > 0 && (
                    <p><strong>Languages:</strong> {selectedUser.languages.join(", ")}</p>
                  )}
                  {selectedUser.interests !== undefined && selectedUser.interests?.length > 0 && (
                    <p className="col-span-2"><strong>Interests:</strong> {selectedUser.interests.join(", ")}</p>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold mt-6">User Posts</h3>
            <div className="mt-4">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div key={post.postId} className="border p-3 rounded-lg shadow-md mt-2">
                    <p className="font-medium">{post.caption}</p>
                    <img src={post.image} alt="Post image" className="w-full mt-2 rounded-md" />
                    <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No posts available.</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 text-center">Search Users</h1>
            <input
              type="text"
              placeholder="Search for a user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
            />
            {isLoading ? (
              <p className="text-center text-gray-600 mt-4">Loading users...</p>
            ) : filteredUsers.length > 0 ? (
              <ul className="mt-4 divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <li
                    key={user.userId}
                    className="flex items-center p-3 cursor-pointer hover:bg-gray-100 rounded-lg transition"
                    onClick={() => {
                      console.log(user)
                      setSelectedUser(user);
                      fetchUserPosts(user.userId);
                    }}
                  >
                    <img
                      className="w-12 h-12 rounded-full border border-gray-300 mr-4"
                      src={user.profilePicture || "/images/null_avatar.png"}
                      alt={user.username}
                    />
                    <div className="text-left">
                      <span className="font-medium text-gray-800">@{user.username}</span>
                      <p className="text-sm text-gray-500">{user.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-600 mt-4">No users found.</p>
            )}
          </>
        )}
      </div>
    </div>
    <Footer />
  </div>

  );
}