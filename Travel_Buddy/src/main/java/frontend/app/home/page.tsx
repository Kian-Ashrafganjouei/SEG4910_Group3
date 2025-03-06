"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../layout/navbar/page";
import Footer from "../layout/footer/page";
import ExploreTripsComponent from "./exploreTripsComponent";

export default function Home() {
  // Information about the user currently logged in.
  const { data: session } = useSession();

  // Page navigation helper.
  const router = useRouter();

  console.log("Session data:", session); // Check the session data

  return (
    <div className="mt-16">
      <Navbar />
      {/* Home Content */}
      <div style={{ padding: "1rem" }}>
        <ExploreTripsComponent />
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
}
