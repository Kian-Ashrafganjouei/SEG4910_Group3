"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

export default function NavbarLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <>
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: "#333",
          color: "white",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
        }}
      >
        <div>
          <h1>
            Welcome{session?.user?.username ? `, ${session.user.username}` : "!"}
          </h1>
        </div>
        <div>
          {session ? (
            <>
              <button
                onClick={() => router.push("/trips/view")}
                style={buttonStyle}
              >
                View Trips
              </button>
              <button
                onClick={() => router.push("/trips/add")}
                style={buttonStyle}
              >
                Add Trip
              </button>
              <button
                onClick={() => router.push("/profile")}
                style={buttonStyle}
              >
                Profile
              </button>
              <button
                onClick={() => signOut()}
                style={{ ...buttonStyle, backgroundColor: "#f44336" }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              style={{ ...buttonStyle, backgroundColor: "#4CAF50" }}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: "5rem" }}>{children}</div>
    </>
  );
}

// Button style
const buttonStyle = {
  marginRight: "1rem",
  padding: "0.5rem 1rem",
  backgroundColor: "#008CBA",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
