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
    <div className="navbar fixed w-full top-0 left-0 z-10 border-b border-slate-300">
      <div className="grid grid-cols-2 md:grid-cols-12 items-center h-16 bg-white text-black">
        <div className="platform-name text-xl font-bold col-span-1 flex justify-center">
          <a href="/">
            <h1 className="text-2xl ">TRACO</h1>
          </a>
        </div>
        <div className="left-links col-span-6 flex space-x-10 relative pl-9">
          <div className="home">
            <a href="/home" className="relative group">
              <span className="hover-underline-animation">Trips</span>
            </a>
          </div>
          <div className="my-trips">
            <a
              href="/trips/mytrips"
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  // Redirect to sign-in, and after signing in, go to /trips/mytrips
                  signIn(undefined, { callbackUrl: "/trips/mytrips" });
                }
              }}
              className="relative group">
              <span className="hover-underline-animation">My Trips</span>
            </a>
          </div>
          <div className="create-trip">
            <a
              href="/trips/add"
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  signIn(undefined, { callbackUrl: "/trips/add" });
                }
              }}
              className="relative group">
              <span className="hover-underline-animation">Create Trip</span>
            </a>
          </div>
          <div className="profile">
            <a
              href="/searchusers"
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  signIn(undefined, { callbackUrl: "/searchusers" });
                }
              }}
              className="relative group">
              <span className="hover-underline-animation">Friends</span>
            </a>
          </div>
        </div>

        <div className="white-space col-span-1"></div>

        <div className="right-links flex space-x-10 col-span-3 justify-end pr-9">
          <div className="friends">
            <a
              href="/profile"
              className="relative group"
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  signIn(undefined, { callbackUrl: "/trips/add" });
                }
              }}>
              <span className="hover-underline-animation">Profile</span>
            </a>
          </div>
          <div className="about-button">
            <a href="/about" className="relative group">
              <span className="hover-underline-animation">About</span>
            </a>
          </div>
          <div className="contact-button">
            <a href="/contact" className="relative group">
              <span className="hover-underline-animation">Contact</span>
            </a>
          </div>
        </div>
        <div className="signin-signout-button hidden md:flex justify-center col-span-1">
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
  );
};

export default Navbar;

{
  /* <div className="hidden md:flex space-x-4 justify-center relative">
  <a href="/home" className="relative group">
    <span className="hover-underline-animation">Home</span>
  </a>
  {session && ( // Only show this section if session exists
    <>
      <button
                    className="relative group "
                    onClick={toggleTripsDropdown}>
                    <span className="hover-underline-animation">Trips</span>
                  </button>

      <a href="/trips/view" className="hover-underline-animation">
        Explore Trips
      </a>
      <a href="/trips/mytrips" className="hover-underline-animation">
        My Trips
      </a>
      <a href="/trips/add" className="hover-underline-animation">
        Create Trip
      </a>
      <a href="/trips/profile" className="hover-underline-animation">
        My Profile View
      </a>
      {isTripsDropdownOpen && (
                    <div className="absolute top-8 left-0 bg-white shadow-lg border rounded-md w-40 z-20"></div>
                  )}

      <a href="/profile" className="relative group">
        <span className="hover-underline-animation"></span>
      </a>
    </>
  )}
  <a href="/about" className="relative group">
    <span className="hover-underline-animation">About</span>
  </a>
  <a href="/contact" className="relative group">
    <span className="hover-underline-animation">Contact</span>
  </a>
</div>; */
}
