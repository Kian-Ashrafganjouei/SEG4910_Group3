import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import "../../styles/Navbar.css";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const { data: session } = useSession();
  const router = useRouter();

  console.log("Session data:", session); // Check the session data

  return (
    <div className="navbar border-b border-stone-300 fixed w-full top-0 left-0 z-10 ">
      <div className="grid grid-cols-2 md:grid-cols-3 items-center h-16 pl-2 pr-2 bg-white text-black">
        <div className="text-xl font-bold">
          <a href="/" className="pl-2">
            Travel Companion
          </a>
        </div>
        <div className="hidden md:flex space-x-4 justify-center gap-5">
          <a href="/home" className="relative group">
            <span className="hover-underline-animation">Home</span>
          </a>
          <a href="/trips/view" className="relative group">
            <span className="hover-underline-animation">Trips</span>
          </a>
          <a href="/profile" className="relative group">
            <span className="hover-underline-animation">My Profile</span>
          </a>
          <a href="/about" className="relative group">
            <span className="hover-underline-animation">About</span>
          </a>
        </div>
        <div className="hidden md:flex justify-end">
          {session ? (
            <button
              onClick={() => signOut()}
              className=" hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded border-2 border-black">
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => signIn()}
              className=" hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded border-2 border-black">
              Sign Up
            </button>
          )}
        </div>
        <div className="md:hidden flex justify-end">
          <button
            onClick={toggleMobileMenu}
            className="text-black focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="grid justify-center md:hidden bg-white text-black p-4">
          <a href="/home" className="grid justify-center underline">
            Home
          </a>
          <a href="/trips" className="grid justify-center underline">
            Trips
          </a>
          <a href="/about" className="grid justify-center underline">
            About
          </a>
          <a href="/contact" className="grid justify-center underline">
            Contact
          </a>
          <a
            href="/signup"
            className="block hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded border-2 border-black mt-2">
            Sign Up
          </a>
        </div>
      )}
    </div>
  );
};

export default Navbar;
