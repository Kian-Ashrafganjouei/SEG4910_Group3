"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      {/* Navigation Bar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: "#333",
          color: "white",
        }}
      >
        <div>
          <h1>
            Welcome{session && session.user?.name ? `, ${session.user.name}` : "!"}
          </h1>
        </div>
        <div>
          {session ? (
            <>
              <button
                onClick={() => window.location.href = '/profile'}
                style={{
                  marginRight: "1rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#008CBA",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Profile
              </button>
              <button
                onClick={() => signOut()}
                style={{
                  marginRight: "1rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Home Content */}
      <div style={{ padding: "2rem" }}>
        <h2>Home Page</h2>
        {session ? (
          <p>Welcome to the home page, {session.user?.name}!</p>
        ) : (
          <p>Please log in to see your personalized content.</p>
        )}
      </div>
    </>
  );
}
