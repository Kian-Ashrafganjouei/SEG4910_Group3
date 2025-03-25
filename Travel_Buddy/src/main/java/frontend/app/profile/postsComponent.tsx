"use client";

import Navbar from "../layout/navbar/page";
import Footer from "../layout/footer/page";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { faStar, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

interface Review {
  post: Post;
  reviewer?:{
    userId: number;
  }  
  rating: number;
  comment: string;
}

interface User {
  userId: number;
  username: string;
  name: string;
  reviewScore: number;
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

export default function PostsComponent() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
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
  const [showPopup, setShowPopup] = useState(false);
  const [newReview, setNewReview] = useState<Review>({post: {postId: -1, caption: "", image: "", createdAt: ""}, rating: 0, comment: ""});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewReview((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect (() => { // save review to db
    if (isSubmitting) {
      
      (async () => {
        try {
          const response = await fetch(`/backend/reviews`, { //upsert review
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newReview),
          });
    
          if (!response.ok) throw new Error("Failed to submit review");
          
          const ratedUser = users.find((user) => user.userId === newReview.post.userTrip?.user.userId);

          if (ratedUser !== undefined) {

            const userPostIds = posts
              .filter((post) => post.userTrip?.user.userId === ratedUser.userId)
              .map((post) => post.postId);

              let userRatingsSum = 0;
            let count = 0;

            for (let i = 0; i<reviews.length; i++) {
              if (userPostIds.includes(reviews[i].post.postId)) {
                userRatingsSum += reviews[i].rating;
                count++;
              }
            }

            ratedUser.reviewScore = count > 0 
                                    ? Math.round(userRatingsSum / count) //average of all ratings of all of user's posts
                                    : 0; 

            const userResponse = await fetch('/backend/user', {
              method: "PUT",                                      // CHECK HOW TO UPDATE A USER
              headers: {"Content-Type": "application/json", 
                Id: ratedUser.userId.toString()
              },
              body: JSON.stringify(ratedUser)
            });            
          } 



          if (!response.ok) throw new Error("Failed to update user rating.");

          setShowPopup(false);
          fetchPosts();
          fetchReviews();
          fetchUsers();
          fetchUserTrips();
        } 
        catch (error) {
          console.error("Error:", error);
        } 
        finally {
          setIsSubmitting(false);
          setNewReview({post: {postId: -1, caption: "", image: "", createdAt: ""}, rating: -1, comment: ""});
        }
      })();
    }
  }, [newReview, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const currUser = users.find( (user) => user.name === session?.user.name && user.username === session?.user.username);
      
      if (currUser === undefined) {
        throw new Error("User not found. Cannot add review.");
      }   

      setNewReview((prev) => ({ ...prev, reviewer: {userId: currUser.userId}}));
    }
    catch (error) {
      console.error("User not found. Cannot add review.", error);
    }
    finally {
      setShowPopup(false);
    }
  };

  const onAddReviewClick = (postId: number) => {
    setShowPopup(true);
    const post = posts.find((p) => p.postId === postId);

    if (post === undefined) {
      throw new Error(`Post with id ${postId} is undefined.`);
    }

    setNewReview((prev) => ({...prev, post: post}));
  }

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

  const toggleReviews = (postId: number) => {
    const reviewsList = document.getElementById(`reviews-list-${postId}`) as HTMLElement;
    const button = document.querySelector(`#reviews-section-${postId} .toggle-reviews-btn`) as HTMLElement;

    if (reviewsList.style.display === "none" || reviewsList.style.display === "") {
      reviewsList.style.display = "block";
      button.textContent = "Hide Reviews";
    } else {
      reviewsList.style.display = "none";
      button.textContent = "Show Reviews";
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

  const [hoveredRating, setHoveredRating] = useState(0);

  const handleMouseEnter = (index) => {
    setHoveredRating(index);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleClick = (index) => {
    setNewReview((prev) => ({...prev, rating: Number.parseInt(index)}));
  };


  useEffect(() => {
    fetchPosts();
    fetchReviews();
    fetchUsers();
    fetchUserTrips();
  }, [session]);

  return (
    <div className="mt-4 w-100">
      <div className="flex flex-col items-center">
        <div className="profile-container">

          <div className="filters flex items-start">
            <label className="block mb-4 flex-auto">
              Filter by User:
              <select
                value={selectedUserId || ""}
                onChange={(e) =>
                  setSelectedUserId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full p-2 border rounded-lg mt-1 bg-white text-black">
                <option value="">Show all posts</option>
                {users.map((user) => (
                  <option
                    key={user.userId}
                    value={user.userId}
                    className="text-black">
                    {user.name} ({user.username})
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={handleFilterPosts}
              className="px-3 py-2 ml-2 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700 self-end">
              Apply Filter
            </button>
          </div>

          {isLoading ? (
            <p className="loading-msg text-center text-xl font-semibold">
              Loading posts...
            </p>
          ) : errorMessage ? (
            <p className="error-msg text-center text-xl text-red-300">
              {errorMessage}
            </p>
          ) : filteredPosts.length > 0 ? (
            <div className="posts-list columns-2 gap-4 space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.postId}
                     className="post-card flex flex-col items-start p-6 rounded-xl shadow-lg bg-white text-black break-inside-avoid border border-gray-200"> 
                  {/* relative max-h-[630px] overflow-y-auto*/}
                  {/* Display Profile Picture and Username */}
                  <div className="flex items-center justify-between w-full mb-4">
                    <img
                      className="w-10 h-10 rounded-full mr-3"
                      src={
                        post.userTrip?.user?.profilePicture
                          ? post.userTrip.user.profilePicture
                          : "/images/null_avatar.png"
                      }
                      alt={post.userTrip?.user?.username || "User Avatar"}
                    />
                    <div className="text-lg font-medium text-gray-700 flex-1">
                      @{post.userTrip?.user?.username || "Unknown"}
                    </div>
                    <div className="relative group">
                      <FontAwesomeIcon icon={faPlus} 
                            onClick={() => onAddReviewClick(post.postId)}
                            className="p-2 text-blue-600 text-lg rounded-md hover:bg-gray-300" />
                      <span className="absolute fixed w-max hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 bottom-full mb-1">
                        Add Review
                      </span>  
                    </div>
                  </div>

                  {/* Display Trip Location */}
                  {post.userTrip?.trip?.location && (
                    <span className="absolute top-4 right-4 text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                      {post.userTrip.trip.location}
                    </span>
                  )}

                  {/* Post Content */}
                  <img src={post.image}
                       alt={post.caption}
                       className="post-image w-full h-64 object-cover rounded-lg mb-4" />
                  <p className="post-caption text-lg text-gray-700 mb-2">
                    {post.caption}
                  </p>
                  <p className="post-date text-sm text-gray-500">
                    Posted on {new Date(post.createdAt).toLocaleDateString()}
                  </p>




                  <div>
                    {/* Popup Modal */}
                    {showPopup && (
                      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-2/3">
                          <h2 className="text-xl font-bold mb-4">Add a Review</h2>
                          <form>

                            <label className="block mb-2"></label>
                            <div className="flex space-x-2 text-3xl mb-5">
                              {[1, 2, 3, 4, 5].map((index) => (
                                <FontAwesomeIcon
                                    key={index}
                                    icon={faStar}
                                    className={index <= (hoveredRating || newReview.rating)
                                      ? "text-yellow-500 cursor-pointer"
                                      : "text-gray-300 cursor-pointer"
                                    }
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={() => handleClick(index)}

                                />
                              ))}
                            </div>

                            <label className="block mb-2">Comment:</label>
                            <textarea
                              name="comment"
                              value={newReview.comment}
                              onChange={handleInputChange}
                              required
                              className="border p-2 w-full mb-3"
                            />

                            <div className="flex justify-end">
                              <button
                                className="px-4 py-2 bg-gray-300 rounded mr-2"
                                onClick={() => setShowPopup(false)}
                              >
                                Cancel
                              </button>
                              <button
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={(e) => handleSubmit(e)}
                                disabled={newReview.rating === 0 || newReview.comment.trim() === ""}
                              >
                                Submit
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>

                  
                  <div id={`reviews-section-${post.postId}`} className="reviews-section mt-4">
                    {/* <button
                      className="toggle-reviews-btn text-sm text-blue-500"
                      onClick={() => toggleReviews(post.postId)}
                    >
                      Show Reviews
                    </button> */}
                    <div
                      id={`reviews-list-${post.postId}`}
                      className="reviews-list mt-4"
                      // style={{ display: "none" }}
                    >

                      {reviews
                        .filter((review) => review.post.postId === post.postId)
                        .map((review) => {
                          const reviewer = users.find((user) => user.userId === review.reviewer?.userId);

                          return (
                            <div className="review-item mb-3">
                              <div className="reviewer text-sm font-semibold text-gray-700">
                                {reviewer ? `${reviewer.name} - ${reviewer.username}` : "User not found"}
                              </div>
                              <div className="rating text-sm">
                                {renderStars(review.rating)}
                              </div>
                              <div className="comment text-sm text-gray-600">{review.comment}</div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
          
                  {/*<div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>*/} {/* bottom fade out div */}

                </div> // end of postcard div
              ))}
            </div> // end of posts list div
          ) : (
            <p className="no-posts-msg text-center text-xl">No posts found.</p>
          )}

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
                className="w-full p-2 border rounded-lg mt-1">
                <option value="">Select a trip</option>
                {userTrips.map((userTrip) => (
                  <option key={userTrip.userTripId} value={userTrip.userTripId}>
                    {userTrip.trip?.location} ({userTrip.trip?.startDate})
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700">
                Cancel
              </button>
              <button
                onClick={handleAddPost}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">
                Add Post
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
