'use client';

import NavBar from "./pages/Navbar";
import { useState, useEffect } from "react";

const Home: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {/* Navigation bar start */}
      <nav className="bg-blue-500 text-white flex justify-between items-center px-4 py-2">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Travel Buddy</h1>
        </div>

        <div className="md:flex">
          <a href="/home" className="mr-4">Home</a> {/* Temporary Home button */}

          {isAuthenticated ? (
            <>
              <a href="/profile" className="mr-4">Profile</a>
              <a href="/trips" className="mr-4">Trips</a>
            </>
          ) : (
            <>
              <a href="/login" className="mr-4">Login</a>
              <a href="/signup" className="mr-4">Create Account</a>
            </>
          )}
        </div>
      </nav>
      {/* Navigation bar end */}
    </>
  );
};

export default Home;
