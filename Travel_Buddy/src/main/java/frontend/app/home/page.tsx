"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../layout/navbar/page";
import Footer from "../layout/footer/page";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  console.log("Session data:", session); // Check the session data

  return (
    <div className="mt-16">
      <Navbar />
      {/* Home Content */}
      <div style={{ padding: "2rem" }}>
        <h2>Home Page</h2>
        {session ? (
          <p>Welcome to the home page, {session.user?.name}!</p>
        ) : (
          <p>Please log in to see your personalized content.</p>
        )}
      </div>
      <Footer />
    </div>
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
};
