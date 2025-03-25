"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select"; // Import React Select
import Navbar from "../layout/navbar/page";
import Footer from "../layout/footer/page";
import { signIn } from "next-auth/react";
import PostsComponent from "./postsComponent";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Interface defining the structure of user data
interface UserData {
  name: string;
  phoneNumber?: string;
  nationality?: string;
  languages?: string[];
  age?: number;
  sex?: string;
  interests?: string[];
  bio?: string;
  profilePicture?: string;
}

// Interface defining the structure of a post
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

// Interface defining the structure of a user trip
interface UserTrip {
  userTripId: number;
  trip: {
    location: string;
    startDate: string;
  };
}

// Main Profile component
export default function Profile() {
  const { data: session } = useSession(); // Access the user session
  const [userData, setUserData] = useState<UserData | null>(null); // State for user data
  const [nationalities, setNationalities] = useState([]); // State for nationalities dropdown options
  const [languages, setLanguages] = useState([]); // State for languages dropdown options
  const [isLoading, setIsLoading] = useState(true); // State to track loading status
  const router = useRouter(); // Router instance for navigation
  const [showEditForm, setShowEditForm] = useState(false);

  // Static list of interests for the interests dropdown
  const staticInterests = [
    { value: "hiking", label: "Hiking" },
    { value: "photography", label: "Photography" },
    { value: "gaming", label: "Gaming" },
    { value: "cooking", label: "Cooking" },
    { value: "reading", label: "Reading" },
    { value: "traveling", label: "Traveling" },
    { value: "sports", label: "Sports" },
  ];

  const [posts, setPosts] = useState<Post[]>([]); // State for user posts
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [newCaption, setNewCaption] = useState(""); // State for new post caption
  const [newImage, setNewImage] = useState<File | null>(null); // State for new post image
  const [selectedUserTripId, setSelectedUserTripId] = useState<number | null>(null); // State for selected trip ID
  const [userTrips, setUserTrips] = useState<UserTrip[]>([]); // State for user trips

  // Fetch nationalities and languages from APIs on component mount
  useEffect(() => {
    const fetchNationalities = async () => {
      const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=cca2,name"
      );
      const data = await response.json();
      const options = data.map((country: any) => ({
        value: country.cca2, // Country code
        label: country.name.common, // Country name
      }));
      setNationalities(options);
    };

    const fetchLanguages = async () => {
      try {
        const response = await fetch("https://libretranslate.com/languages");
        if (!response.ok) {
          throw new Error("Failed to fetch languages");
        }
        const data = await response.json();
        const options = data.map((lang: any) => ({
          value: lang.code, // Language code (e.g., "en", "fr")
          label: lang.name, // Language name (e.g., "English", "French")
        }));
        setLanguages(options);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };

    fetchNationalities();
    fetchLanguages();
  }, []);

  // Fetch user trips when the session is available
  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/backend/user-trips?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => setUserTrips(data))
        .catch((err) => console.error("Error fetching user trips:", err));
    }
  }, [session]);

  // Fetch user data when the session is available
  useEffect(() => {
    if (session) {
      fetch("/backend/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Email: session?.user?.email || "",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUserData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch user data", err);
          setIsLoading(false);
        });
    }
  }, [session]);

  // Function to handle profile update
  const handleUpdate = async () => {
    try {
      const res = await fetch("/backend/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Email: session?.user?.email || "",
        },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      alert("Profile updated successfully!");

      router.push("/trips/mytrips"); // Redirect after session refresh
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  // Function to handle adding a new post
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
    } catch (error) {
      console.error("Error adding post:", error);
      alert("An error occurred while adding the post.");
    }
  };

  // If there is no session, prompt the user to log in
  if (!session) {
    return <p className="login-msg">Please log in to view your profile.</p>;
  }

  // Show loading message while data is being fetched
  if (isLoading) {
    return <p className="loading-msg">Loading profile...</p>;
  }

  return (
    <div className="profile-page mt-16">
      {/* Navbar Component */}
      <Navbar />
  
      {/* Main Profile Container */}
      <div className="flex justify-center">
        <div className="profile-container w-1/2 m-12 grid grid-rows-[auto,1fr,auto] gap-10 pt-5 pb-5">
          {/* Profile Header Section */}
          <div className="profile-header flex items-center gap-5">
            {/* Profile Picture Section */}
            <div className="relative w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center font-bold text-white overflow-hidden">
              {/* Display Profile Picture if available, otherwise show a placeholder */}
              {userData?.profilePicture ? (
                <img
                  src={userData.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-xl">+</span>
              )}
  
              {/* Button to Upload New Profile Picture */}
              <label
                htmlFor="profilePicture"
                className="absolute bottom-0 right-0 w-6 h-6 bg-purple-500 rounded-full text-white text-sm cursor-pointer hover:bg-purple-600">
                +
              </label>
              {/* Hidden File Input for Profile Picture Upload */}
              <input
                id="profilePicture"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const imageUrl = event.target?.result as string;
                      setUserData((prevUserData) => ({
                        ...prevUserData,
                        profilePicture: imageUrl,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
  
            {/* Display User Name */}
            <div className="profile-name flex-auto">
              <span className="user-name text-3xl">
                {userData?.name || "Name Name"}
              </span>
            </div>

            <div className="relative group">
              <FontAwesomeIcon icon={faEdit} 
                              onClick={() => setShowEditForm(!showEditForm)}
                              className="p-2 text-blue-600 text-2xl rounded-md hover:bg-gray-300"/>       
              <span className="absolute w-max hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 bottom-full mb-1">
                Edit Profile
              </span>
            </div>
                
            <div className="relative group">
              <FontAwesomeIcon icon={faPlus} 
                              onClick={() => setIsModalOpen(true)}
                              className="p-2 text-blue-600 text-2xl rounded-md hover:bg-gray-300"/>  
              <span className="absolute w-max hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 bottom-full mb-1">
                New Post
              </span>              
            </div>
      
          </div>

          <div style={{display: showEditForm ? "block" : "none"}}>
  
            {/* Profile Form Section */}
            {userData && (
              <div className="form-container grid grid-rows-5 gap-3">
                {/* Name Field */}
                <div className="form-group mb-4 text-color">
                  <label>Name</label>
                  <input
                    type="text"
                    value={userData.name || ""}
                    onChange={(e) =>
                      setUserData({ ...userData, name: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
    
                {/* Row for Nationality and Sex Fields */}
                <div className="row2 grid grid-cols-2 gap-5">
                  {/* Nationality Dropdown */}
                  <div className="nationality-form form-group mb-4 ">
                    <label>Nationality</label>
                    <select
                      className="input-field"
                      value={userData.nationality} // Should be a string
                      onChange={(event) =>
                        setUserData({
                          ...userData,
                          nationality: event.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      {/* Map through nationalities to create dropdown options */}
                      {nationalities.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sex Dropdown */}
                  <div className="sex-form form-group mb-4 text-color">
                    <label>Sex</label>
                    <select
                      value={userData.sex || ""}
                      onChange={(e) =>
                        setUserData({ ...userData, sex: e.target.value })
                      }
                      className="input-field">
                      <option value="">Select</option>
                      {/* Map through sex options */}
                      {["Male", "Female", "Other"].map((sex) => (
                        <option key={sex} value={sex}>
                          {sex}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Languages Multi-Select Dropdown */}
                <div className="language-form form-group mb-4 text-color">
                  <label>Languages</label>
                  <div className="input-field">
                    <Select
                      className="input-field"
                      isMulti
                      options={languages}
                      value={languages.filter((option) =>
                        userData.languages?.includes(option.value)
                      )}
                      onChange={(selectedOptions) =>
                        setUserData({
                          ...userData,
                          languages: selectedOptions.map(
                            (option) => option.value
                          ),
                        })
                      }
                    />
                  </div>
                </div>
    
                {/* Row for Age and Phone Number Fields */}
                <div className="age-num grid grid-cols-2 gap-5">
                  {/* Age Field */}
                  <div className="age-form form-group mb-4 text-color">
                    <label>Age:</label>
                    <input
                      type="number"
                      placeholder="1"
                      value={userData.age || ""}
                      onChange={(e) =>
                        setUserData({ ...userData, age: Number(e.target.value) })
                      }
                      className="input-field"
                    />
                  </div>

                  {/* Phone Number Field */}
                  <div className="phonenum-form form-group mb-4 text-color">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      value={userData.phoneNumber || ""}
                      onChange={(e) =>
                        setUserData({ ...userData, phoneNumber: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Interests Multi-Select Dropdown */}
                <div className="interest-form form-group mb-4 ">
                  <label>Interests</label>
                  <div className="input-field">
                    <Select
                      isMulti
                      options={staticInterests}
                      value={staticInterests.filter((option) =>
                        userData?.interests?.includes(option.value)
                      )}
                      onChange={(selectedOptions) =>
                        setUserData({
                          ...userData,
                          interests: selectedOptions.map(
                            (option) => option.value
                          ),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
    
            {/* Submit Buttons Section */}
            <div className="submit-button grid justify-end">
              {/* Update Profile Button */}
              <button
                className="update-button w-28 h-12 text-xl font-bold bg-purple-500 text-white rounded-lg hover:bg-white hover:text-purple-500 hover:border-2 hover: border-purple-500"
                onClick={handleUpdate}>
                Update
              </button>
            </div>
          </div>

          <PostsComponent />
        </div>
      </div>

      {/* Add Post Modal */}
      {isModalOpen && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white p-8 rounded-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">Add a New Post</h2>
            {/* Caption Input */}
            <label className="block mb-4">
              Caption:
              <input
                type="text"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                className="w-full p-2 border rounded-lg mt-1"
              />
            </label>
            {/* Image Upload Input */}
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
            {/* Trip Selection Dropdown */}
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
                {/* Map through user trips to create dropdown options */}
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
            {/* Modal Action Buttons */}
            <div className="flex justify-end space-x-4">
              {/* Cancel Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              {/* Add Post Button */}
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
  
      {/* Inline Styles for the Component */}
      <style jsx>{`
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .input-field {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
          color: #000;
        }

        /* Customize react-select options */
        .react-select__option {
          color: black; /* Black text for dropdown options */
          background-color: white; /* White background */
          cursor: pointer;
        }

        .react-select__option--is-focused {
          background-color: #ede7f6; /* Purple tint when hovered */
          color: black; /* Keep text black on hover */
        }

        .react-select__option--is-selected {
          background-color: #d1c4e9; /* Slightly darker purple for selected */
          color: black; /* Keep text black for selected option */
        }

        .loading-msg,
        .no-trips-msg,
        .error-msg {
          text-align: center;
          font-size: 1.3rem;
          margin-top: 1rem;
        }

        .error-msg {
          color: #d32f2f;
        }
      `}</style>
  
      {/* Footer Component */}
      <Footer />
    </div>
  );
}
