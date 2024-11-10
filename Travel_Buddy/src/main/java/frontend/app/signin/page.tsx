"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faApple } from "@fortawesome/free-brands-svg-icons";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";

export default function SignInForm() {
  const [username, set_username] = useState("");
  const [password, set_password] = useState("");
  const [error, set_error] = useState("");

  const signin_form_submission_handler = async (e) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/home",
      username,
      password,
    });

    if (res.error) {
      set_error("Invalid username or password");
      return;
    } else {
      window.location.href = "/home";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700">Login</h2>
        {error !== "" && (
          <div className="p-4 mt-2 text-red-700 bg-red-100 border border-red-300 rounded-lg">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="mr-2 size-4"
            />
            <strong>{error}</strong>
          </div>
        )}
        <form className="space-y-4" onSubmit={signin_form_submission_handler}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              id="username"
              required
              className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="username"
              onChange={(e) => set_username(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="••••••••"
              onChange={(e) => set_password(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Login
          </button>
        </form>

        <div className="flex items-center justify-between mt-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-2 text-gray-500">Or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="flex justify-between mt-4 gap-3">
          <button
            className="flex items-center justify-center w-1/2 p-2 text-white bg-red-500 rounded-md hover:bg-red-600"
            onClick={() => signIn("google", { callbackUrl: "/" })}>
            <FontAwesomeIcon icon={faGoogle} className="mr-2 size-4" /> Sign in
            with Google
          </button>
          <button className="flex items-center justify-center w-1/2 p-2 text-white bg-gray-800 rounded-md hover:bg-gray-700">
            <FontAwesomeIcon icon={faApple} className="mr-2 size-4" /> Sign in
            with Apple
          </button>
        </div>

        <p className="text-sm text-center text-gray-500">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline mr-2">
            Sign up
          </a>
        </p>

        <p className="text-sm text-center text-gray-500">
          Want to be forgotten?{" "}
          <a href="/forgetme" className="text-red-600 hover:underline mr-2">
            Delete my account
          </a>
        </p>
      </div>
    </div>
  );
}
