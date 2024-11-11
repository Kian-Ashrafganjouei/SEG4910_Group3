"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../layout/navbar/page";
import Footer from "../layout/footer/page";
import ViewTrips from '../trips/view/page';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  console.log("Session data:", session); // Check the session data

  return (
    <>
      <Navbar />
      {/* Navigation Bar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: "#333",
          color: "white",
        }}>
        <div>
          <h1>
            Welcome
            {session?.user?.username ? `, ${session.user.username}` : "!"}
          </h1>
        </div>
        <div>
          {session ? (
            <>
              <button
                onClick={() => router.push("/trips/view")}
                style={buttonStyle}>
                View Trips
              </button>
              <button
                onClick={() => router.push("/trips/add")}
                style={buttonStyle}>
                Add Trip
              </button>
              <button
                onClick={() => router.push("/profile")}
                style={buttonStyle}>
                Profile
              </button>
              <button
                onClick={() => signOut()}
                style={{ ...buttonStyle, backgroundColor: "#f44336" }}>
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              style={{ ...buttonStyle, backgroundColor: "#4CAF50" }}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Home Content */}
      <div style={{ padding: "1rem" }}>
        <ViewTrips />
      </div>
      <Footer />
    </>
  );
}

// Button style object to reuse styles across buttons
const buttonStyle = {
  marginRight: "1rem",
  padding: "0.5rem 1rem",
  backgroundColor: "#008CBA",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
}
