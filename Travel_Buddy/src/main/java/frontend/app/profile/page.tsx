"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../layout/navbar/page";
import Footer from "../layout/footer/page";

interface UserData {
  name: string;
  phoneNumber?: string;
  nationality?: string;
  languages?: string[]; // Ensure it's a string array
  age?: number;
  sex?: string;
  interests?: string[];
  bio?: string;
}

const nationalities = ["Canadian", "American", "British", "Indian", "Chinese"]; // Example options
const sexes = ["Male", "Female", "Other"]; // Example options
const languageOptions = ["English", "French", "Spanish", "Chinese", "Hindi"]; // Example languages
const interestOptions = ["Reading", "Hiking", "Gaming", "Traveling", "Cooking"];

export default function Profile() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("Sending profile update to backend with data:", userData);
    if (session) {
      // Fetch user data from backend
      fetch("http://localhost:8080/backend/user", {
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

  const handleUpdate = () => {
    console.log("Sending profile update to backend");
    // Handle user update logic here
    fetch("http://localhost:8080/backend/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Email: session?.user?.email || "",
      },
      body: JSON.stringify(userData),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Profile updated successfully!");
      })
      .catch((err) => {
        console.error("Failed to update profile", err);
      });
  };

  if (!session) {
    return <p className="login-msg">Please log in to view your profile.</p>;
  }

  if (isLoading) {
    return <p className="loading-msg">Loading profile...</p>;
  }

  return (
    <div>
      <Navbar />
      <nav className="nav-bar">
        <div className="nav-content">
          <h1 className="welcome-text">
            Welcome
            {session && session.user?.username
              ? `, ${session.user.username}`
              : "!"}
          </h1>
          <button className="back-button" onClick={() => router.push("/home")}>
            Back
          </button>
        </div>
      </nav>
      <div className="profile-container">
        {/* Full-Width Navigation Bar */}

        <div className="profile-content">
          <h2>Profile Page</h2>
          {userData && (
            <div className="form-container">
              {/* Name Field */}
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={userData.name || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              {/* Phone Number Field */}
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  value={userData.phoneNumber || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, phoneNumber: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              {/* Nationality Dropdown */}
              <div className="form-group">
                <label>Nationality:</label>
                <select
                  value={userData.nationality || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, nationality: e.target.value })
                  }
                  className="input-field">
                  <option value="">Select</option>
                  {nationalities.map((nation) => (
                    <option key={nation} value={nation}>
                      {nation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Languages Checkboxes */}
              <div className="form-group">
                <label>Languages:</label>
                <div className="checkbox-group">
                  {languageOptions.map((language) => (
                    <label key={language} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={
                          Array.isArray(userData?.languages) &&
                          userData?.languages.includes(language)
                        }
                        onChange={(e) => {
                          const isChecked = e.target.checked;

                          // Ensure that userData.languages is an array
                          const currentLanguages = Array.isArray(
                            userData?.languages
                          )
                            ? userData?.languages
                            : [];

                          const updatedLanguages = isChecked
                            ? [...currentLanguages, language]
                            : currentLanguages.filter(
                                (lang) => lang !== language
                              );

                          setUserData({
                            ...userData,
                            languages: updatedLanguages,
                          });
                        }}
                        className="checkbox-input"
                      />
                      {language}
                    </label>
                  ))}
                </div>
              </div>

              {/* Age Field */}
              <div className="form-group">
                <label>Age:</label>
                <input
                  type="number"
                  value={userData.age || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, age: Number(e.target.value) })
                  }
                  className="input-field"
                />
              </div>

              {/* Sex Dropdown */}
              <div className="form-group">
                <label>Sex:</label>
                <select
                  value={userData.sex || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, sex: e.target.value })
                  }
                  className="input-field">
                  <option value="">Select</option>
                  {sexes.map((sex) => (
                    <option key={sex} value={sex}>
                      {sex}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interests Checkboxes */}
              <div className="form-group">
                <label>Intrests:</label>
                <div className="checkbox-group">
                  {interestOptions.map((interest) => (
                    <label key={interest} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={
                          Array.isArray(userData?.interests) &&
                          userData?.interests.includes(interest)
                        }
                        onChange={(e) => {
                          const isChecked = e.target.checked;

                          const currentInterests = Array.isArray(
                            userData?.interests
                          )
                            ? userData?.interests
                            : [];

                          const updatedInterests = isChecked
                            ? [...currentInterests, interest]
                            : currentInterests.filter(
                                (lang) => lang !== interest
                              );

                          setUserData({
                            ...userData,
                            interests: updatedInterests,
                          });
                        }}
                        className="checkbox-input"
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>

              {/* Bio Field */}
              <div className="form-group">
                <label>Bio:</label>
                <textarea
                  value={userData.bio || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, bio: e.target.value })
                  }
                  className="textarea-field"
                />
              </div>

              <button className="update-button" onClick={handleUpdate}>
                Update Profile
              </button>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .nav-content {
          max-width: 100%;
          width: 100%;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-content {
          width: 100%;
          // position: fixed;
          top: 0;
          left: 0;
          background-color: #333;
          color: white;
          z-index: 1000;
          padding: 1rem 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .welcome-text {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .back-button {
          padding: 0.5rem 1rem;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .profile-container {
          padding-top: 6rem;
          padding-bottom: 2rem;
          max-width: 600px;
          margin: 0 auto;
          font-family: Arial, sans-serif;
        }
        .profile-content {
          background-color: #f9f9f9;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          color: black; /* Set text color to black */
        }

        /* Additional rules for specific elements */
        .profile-content h2,
        .profile-content label,
        .profile-content p,
        .profile-content input,
        .profile-content textarea {
          color: black; /* Ensure all specific text elements are also black */
        }

        .form-container {
          display: flex;
          flex-direction: column;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .input-field,
        .textarea-field {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .textarea-field {
          resize: vertical;
          height: 100px;
        }
        .update-button {
          padding: 0.7rem 1.5rem;
          background-color: #008cba;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          align-self: flex-start;
        }
        .update-button:hover {
          background-color: #005f7a;
        }
        .login-msg,
        .loading-msg {
          font-size: 1.2rem;
          text-align: center;
          margin-top: 2rem;
        }
        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .custom-checkbox-label {
          position: relative;
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 10px 15px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #f0f0f0;
          transition: background-color 0.3s, border-color 0.3s;
        }
        .custom-checkbox-label:hover {
          background-color: #e0e0e0;
          border-color: #888;
        }
        .custom-checkbox-input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }
        .custom-checkbox-mark {
          position: absolute;
          top: 50%;
          left: 8px;
          width: 16px;
          height: 16px;
          background-color: white;
          border: 2px solid #888;
          border-radius: 4px;
          transform: translateY(-50%);
        }
        .custom-checkbox-input:checked ~ .custom-checkbox-mark {
          background-color: #008cba;
          border-color: #005f7a;
        }
        .custom-checkbox-mark::after {
          content: "";
          position: absolute;
          display: none;
        }
        .custom-checkbox-input:checked ~ .custom-checkbox-mark::after {
          display: block;
        }
        .custom-checkbox-mark::after {
          left: 4px;
          top: 1px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      `}</style>
      <Footer />
    </div>
  );
}
