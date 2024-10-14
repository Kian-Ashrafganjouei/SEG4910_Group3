"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SearchTrips from "../components/SearchTrips";
import PostTrip from "../components/PostTrip";
import ViewTrips from "../components/ViewTrips";

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"search" | "post" | "view">("search");
  const router = useRouter();

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white">
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold">Travel Buddy</h1>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={handleProfileClick}
          >
            My Profile
          </button>
        </header>
        <nav className="flex space-x-4 mb-6">
          <button onClick={() => setActiveTab("search")} className="bg-blue-500 text-white py-2 px-4 rounded">
            Search a Trip
          </button>
          <button onClick={() => setActiveTab("post")} className="bg-green-500 text-white py-2 px-4 rounded">
            Post a Trip
          </button>
          <button onClick={() => setActiveTab("view")} className="bg-purple-500 text-white py-2 px-4 rounded">
            View Your Trips
          </button>
        </nav>
        <main>
          {activeTab === "search" && <SearchTrips />}
          {activeTab === "post" && <PostTrip />}
          {activeTab === "view" && <ViewTrips />}
        </main>
      </div>
    </div>
  );
};

export default HomePage;
