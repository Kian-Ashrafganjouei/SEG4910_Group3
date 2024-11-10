import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import "../../styles/Navbar.css";

const Navbar = () => {
  const [isTripsDropdownOpen, setIsTripsDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleTripsHover = (isHovered: boolean) => {
    setIsTripsDropdownOpen(isHovered);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" }); // Explicitly redirect to the root page after sign-out
  };

  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: "/home" }); // Redirect to /home after sign in
  };

  const { data: session } = useSession();
  const router = useRouter();

  console.log("Session data:", session); // Check the session data

  return (
    <div>
      <div className="navbar fixed w-full top-0 left-0 z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 items-center h-16 pl-2 pr-2 bg-white text-black">
          <div className="text-xl font-bold">
            <a href="/">
              <h1 className="text-2xl">
                {" "}
                {/* Keep the heading larger */}
                Travel Companion
              </h1>
            </a>
            <p className="text-sm mt-1">
              {" "}
              {/* Make the "Welcome" message smaller */}
              Welcome
              {session?.user?.username ? `, ${session.user.username}` : "!"}
            </p>
          </div>
          <div className="hidden md:flex space-x-4 justify-center relative">
            <a href="/home" className="relative group">
              <span className="hover-underline-animation">Home</span>
            </a>
            {session && ( // Only show this section if session exists
              <>
                <div
                  className="relative group"
                  onMouseEnter={() => handleTripsHover(true)}
                  onMouseLeave={() => handleTripsHover(false)}>
                  <a href="/trips/view" className="relative group">
                    <span className="hover-underline-animation">Trips</span>
                  </a>
                  {isTripsDropdownOpen && (
                    <div className="absolute top-8 left-0 bg-white shadow-lg border rounded-md w-40 z-20">
                      <a
                        href="/trips/view"
                        className="block px-4 py-2 hover:bg-gray-100 text-black">
                        Explore Trips
                      </a>
                      <a
                        href="/trips/mytrips"
                        className="block px-4 py-2 hover:bg-gray-100 text-black">
                        My Trips
                      </a>
                      <a
                        href="/trips/add"
                        className="block px-4 py-2 hover:bg-gray-100 text-black">
                        Create Trip
                      </a>
                    </div>
                  )}
                </div>
                <a href="/profile" className="relative group">
                  <span className="hover-underline-animation">Profile</span>
                </a>
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
      <div className="content-wrapper pt-1">{/* Add padding here */}</div>
    </div>
  );
};

export default Navbar;
