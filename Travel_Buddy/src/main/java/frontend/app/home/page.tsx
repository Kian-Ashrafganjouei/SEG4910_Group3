"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../layout/navbar/page";
import Footer from "../layout/footer/page";
import ExploreTripsComponent from "./exploreTripsComponent";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

import AddTrip from "../trips/add/page";

export default function Home() {
  // Information about the user currently logged in.
  const { data: session } = useSession();
  const [showNewTripModal, setShowNewTripModal] = useState(false);


  // Page navigation helper.
  const router = useRouter();

  console.log("Session data:", session); // Check the session data

    // Close modal on ESC
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") setShowNewTripModal(false);
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

  return (
    <div className="mt-16">
      <Navbar />
      {/* Home Content */}
      <div style={{ padding: "1rem" }}>
        <ExploreTripsComponent />
      </div>

      <div className="flex w-full items-center">
        <span className="m-auto"></span>
        <div onClick={() => setShowNewTripModal(true)} className="group cursor-pointer m-[20px] inline-flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full hover:w-auto hover:px-4 transition-all duration-300 ease-in-out">
          <FontAwesomeIcon icon={faPlus} className="text-lg" />
          <span className="whitespace-nowrap ml-2 hidden group-hover:block transition-all duration-300 ease-in-out">
            Create Trip
          </span>
        </div>
      </div>


      {showNewTripModal && (
        <div className="fixed inset-0 flex items-center justify-center rounded-sm bg-black bg-opacity-50 z-50 m-2">
          <div className="bg-white w-[90%] max-w-4xl max-h-[90vh] p-6 rounded-lg shadow-lg relative">
            {/* Close Button */}
            <button 
              className="absolute cursor-pointer top-4 right-4 text-gray-600 hover:text-gray-900"
              onClick={() => setShowNewTripModal(false)}
            >
              <FontAwesomeIcon icon={faTimes} className="text-2xl" />
            </button>

            {/* Create Trip Form */}
            <AddTrip closeModal={() => setShowNewTripModal(false)} /> 
          </div>
        </div>
      )}


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
