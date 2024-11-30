"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select"; // Import React Select
import Navbar from "../layout/navbar/page";
import Footer from "../layout/footer/page";
import { signIn } from "next-auth/react";

interface UserData {
  name: string;
  phoneNumber?: string;
  nationality?: string;
  languages?: string[];
  age?: number;
  sex?: string;
  interests?: string[];
  bio?: string;
}

export default function Profile() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [nationalities, setNationalities] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const staticInterests = [
    { value: "hiking", label: "Hiking" },
    { value: "photography", label: "Photography" },
    { value: "gaming", label: "Gaming" },
    { value: "cooking", label: "Cooking" },
    { value: "reading", label: "Reading" },
    { value: "traveling", label: "Traveling" },
    { value: "sports", label: "Sports" },
  ];

  // Fetch Nationalities and Languages from APIs
  useEffect(() => {
    const fetchNationalities = async () => {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=cca2,name");
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

  // Fetch User Data
  useEffect(() => {
    if (session) {
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

  const handleUpdate = async () => {
    try {
      const res = await fetch("http://localhost:8080/backend/user", {
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

  if (!session) {
    return <p className="login-msg">Please log in to view your profile.</p>;
  }

  if (isLoading) {
    return <p className="loading-msg">Loading profile...</p>;
  }

  return (
    <div className=" profile-page mt-16">
      <Navbar />
      <div className="flex justify-center">
        <div className="profile-container w-5/12 p-8 m-12 bg-violet-200 rounded-2xl">
          <h1 className="title">Your Profile</h1>
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
                <Select
                  options={nationalities}
                  value={nationalities.find(
                    (option) => option.value === userData.nationality
                  )}
                  onChange={(selectedOption) =>
                    setUserData({
                      ...userData,
                      nationality: selectedOption?.value || "",
                    })
                  }
                />
              </div>

              {/* Languages Multi-Select Dropdown */}
              <div className="form-group">
                <label>Languages:</label>
                <Select
                  isMulti
                  options={languages}
                  value={languages.filter((option) =>
                    userData.languages?.includes(option.value)
                  )}
                  onChange={(selectedOptions) =>
                    setUserData({
                      ...userData,
                      languages: selectedOptions.map((option) => option.value),
                    })
                  }
                />
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
                  {["Male", "Female", "Other"].map((sex) => (
                    <option key={sex} value={sex}>
                      {sex}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interests Multi-Select Dropdown */}
              <div className="form-group">
                <label>Interests:</label>
                <Select
                  isMulti
                  options={staticInterests}
                  value={staticInterests.filter((option) =>
                    userData?.interests?.includes(option.value)
                  )}
                  onChange={(selectedOptions) =>
                    setUserData({
                      ...userData,
                      interests: selectedOptions.map((option) => option.value),
                    })
                  }
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
        .profile-container {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          font-family: "Poppins", sans-serif;
        }

        .title {
          text-align: center;
          font-size: 3rem;
          color: #512da8;
          margin-bottom: 2rem;
          font-weight: 700;
        }

        .form-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
          color: #512da8;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #4a148c;
        }

        .input-field {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
          background-color: #ede7f6;
          color: #000;
        }

        .update-button {
          padding: 0.7rem 1.5rem;
          background-color: #008cba;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          cursor: pointer;
        }

        .update-button:hover {
          background-color: #005f7a;
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
      <Footer />
    </div>
  );
}
