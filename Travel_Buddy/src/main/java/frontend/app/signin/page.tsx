"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle, faApple } from '@fortawesome/free-brands-svg-icons';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";
import { useSession } from "../session";

export default function SignInForm() {
  const [username, set_username] = useState("");
  const [password, set_password] = useState("");
  const [error, set_error] = useState("");
  const session = useSession();

  const signin_form_submission_handler = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/backend/signin", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password})
      });
      if (res.status === 400) {
        set_error(await res.text());
      } else if (!res.ok) {
        throw new Error();
      } else {
        session.login(await res.json());
      }
    } catch (error) {
      set_error("An error occured. Please try again.");
      console.error(error);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700">Login</h2>
        {
          error !== "" &&
          <div className="p-4 mt-2 text-red-700 bg-red-100 border border-red-300 rounded-lg">
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2 size-4" /> 
            <strong>{error}</strong>
          </div>

        }
        <form className="space-y-4" onSubmit={signin_form_submission_handler}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              id="username"
              required
              className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="username"
              onChange={(e) => set_username(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              onChange={(e) => set_password(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>

        <div className="flex items-center justify-between mt-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-2 text-gray-500">Or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="flex justify-between mt-4 gap-3">
          <a 
            className="flex items-center justify-center w-1/2 p-2 text-white bg-red-500 rounded-md hover:bg-red-600"
            href="/api/auth/signin/google"
          >
            <FontAwesomeIcon icon={faGoogle} className="mr-2 size-4" /> Sign in with Google
          </a>
          <button className="flex items-center justify-center w-1/2 p-2 text-white bg-gray-800 rounded-md hover:bg-gray-700">
            <FontAwesomeIcon icon={faApple} className="mr-2 size-4" /> Sign in with Apple
          </button>
        </div>

        <p className="text-sm text-center text-gray-500">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
