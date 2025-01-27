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

  // Fetch User Data
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
        <div className="profile-container w-1/2 m-12 grid grid-rows-[auto,1fr,auto] gap-10 pt-5 pb-5">
          <div className="profile-header flex items-center gap-5">
            <div className="relative w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center font-bold text-white overflow-hidden">
              {/* Profile Picture */}
              {userData?.profilePicture ? (
                <img
                  src={userData.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-xl">+</span>
              )}

              {/* Add Picture Button */}
              <label
                htmlFor="profilePicture"
                className="absolute bottom-0 right-0 w-6 h-6 bg-purple-500 rounded-full text-white text-sm cursor-pointer hover:bg-purple-600">
                +
              </label>
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
                      setUserData({ ...userData, profilePicture: imageUrl });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
            <div className="profile-name">
              <span className="user-name text-3xl">
                {userData?.name || "Name Name"}
              </span>
            </div>
          </div>
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

              <div className="row2 grid grid-cols-2 gap-5">
                {/* Nationality Dropdown */}
                <div className="nationality-form form-group mb-4 ">
                  <label>Nationality</label>
                  <select
                    className="input-field"
                    value={nationalities.find(
                      (option) => option.value === userData.nationality
                    )}
                    onChange={(selectedOption) =>
                      setUserData({
                        ...userData,
                        nationality: selectedOption?.value || "",
                      })
                    }>
                    <option value="">Select</option>
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
          <div className="submit-button grid justify-end">
            <button
              className="update-button w-28 h-12 text-xl font-bold bg-purple-500 text-white rounded-lg hover:bg-white hover:text-purple-500 hover:border-2 hover: border-purple-500"
              onClick={handleUpdate}>
              Update
            </button>
          </div>
        </div>
      </div>

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
      <Footer />
    </div>
  );
}
