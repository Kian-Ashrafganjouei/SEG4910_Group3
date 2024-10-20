"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  name: string;
  email: string;
}

export default function Profile() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      // Fetch user data from backend
      fetch("http://localhost:8080/backend/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Email": session?.user?.email || "",
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
    // Handle user update logic here
    fetch("http://localhost:8080/backend/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
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
    return <p>Please log in to view your profile.</p>;
  }

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div style={{ padding: "0rem" }}>
  {/* Navigation Bar */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        backgroundColor: "#333",
        color: "white"
      }}>
        <div>
          <h1>
            Welcome{session && session.user?.name ? `, ${session.user.name}` : "!"}
          </h1>
        </div>
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </nav>
      <h2>Profile Page</h2>
      {userData && (
        <div>
          <label>
            Name:
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              style={{ marginLeft: "1rem", padding: "0.5rem" }}
            />
          </label>
          <br />
          <label>
            Email:
            <input
              type="text"
              value={userData.email}
              disabled
              style={{ marginLeft: "1rem", padding: "0.5rem" }}
            />
          </label>
          <br />
          <button
            onClick={handleUpdate}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#008CBA",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Update Profile
          </button>
        </div>
      )}
    </div>
  );
}
