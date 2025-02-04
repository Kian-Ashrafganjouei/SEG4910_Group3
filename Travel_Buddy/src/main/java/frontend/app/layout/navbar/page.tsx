import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "../../styles/Navbar.css";

const Navbar = () => {
  const [isTripsDropdownOpen, setIsTripsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();


  const toggleTripsDropdown = () => {
    setIsTripsDropdownOpen(!isTripsDropdownOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" }); // Explicitly redirect to the root page after sign-out
  };

  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: "/home" }); // Redirect to /home after sign in
  };

  return (
    <div>
      <div className="navbar fixed w-full top-0 left-0 z-10 border-b border-slate-300">
        <div className="grid grid-cols-2 md:grid-cols-3 items-center h-16 pl-2 pr-2 bg-white text-black">
          <div className="text-xl font-bold">
            <a href="/">
              <h1 className="text-2xl">Travel Companion</h1>
            </a>
            <p className="text-sm mt-1">
              Welcome {session?.user?.username ? `, ${session.user.username}` : "!"}
            </p>
          </div>
          <div className="hidden md:flex space-x-4 justify-center relative">
            <a href="/home" className="relative group">
              <span className="hover-underline-animation">Home</span>
            </a>
            {session && (
              <>
                <div className="relative">
                  <button
                    className="relative group"
                    onClick={toggleTripsDropdown}>
                    <span className="hover-underline-animation">Trips</span>
                  </button>
                  {isTripsDropdownOpen && (
                    <div className="absolute top-8 left-0 bg-white shadow-lg border rounded-md w-40 z-20">
                      <a href="/trips/view" className="block px-4 py-2 hover:bg-gray-100 text-black">
                        Explore Trips
                      </a>
                      <a href="/trips/mytrips" className="block px-4 py-2 hover:bg-gray-100 text-black">
                        My Trips
                      </a>
                      <a href="/trips/add" className="block px-4 py-2 hover:bg-gray-100 text-black">
                        Create Trip
                      </a>
                      <a href="/trips/profile" className="block px-4 py-2 hover:bg-gray-100 text-black">
                        My Profile View
                      </a>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    className="relative group"
                    onClick={toggleProfileDropdown}>
                    <span className="hover-underline-animation">Profile</span>
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute top-8 left-0 bg-white shadow-lg border rounded-md w-40 z-20">
                      <a href="/profile" className="block px-4 py-2 hover:bg-gray-100 text-black">
                        View Profile
                      </a>
                      <a href="/profileview" className="block px-4 py-2 hover:bg-gray-100 text-black">
                        Settings
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
            <a href="/about" className="relative group">
              <span className="hover-underline-animation">About</span>
            </a>
            <a href="/contact" className="relative group">
              <span className="hover-underline-animation">Contact</span>
            </a>
          </div>
          <div className="hidden md:flex justify-end">
            {session ? (
              <button
                onClick={handleSignOut}
                className="hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded border-2 border-black">
                Sign Out
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded border-2 border-black">
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
