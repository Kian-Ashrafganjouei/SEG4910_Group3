"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function ForgetMeForm() {
  const [email, set_email] = useState("");
  const [error, set_error] = useState("");
  const [success, set_success] = useState("");

  const forgetme_form_submission_handler = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/backend/forgetme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (res.status === 400) {
        set_error(await res.text());
      } else if (!res.ok) {
        throw new Error("Internal server error");
      } else {
        set_error("");
        set_email("");
        set_success("Your profile has been deleted! You will be redirected soon.");
        setTimeout(() => {
          signOut({ callbackUrl: "/" }); // Log out and redirect
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      set_error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700">We will miss you!</h2>
        {error !== "" && (
          <div className="p-4 mt-2 text-red-700 bg-red-100 border border-red-300 rounded-lg">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="mr-2 size-4"
            />
            <strong>{error}</strong>
          </div>
        )}
        {success !== "" && (
          <div className="p-4 mt-2 text-green-700 bg-green-100 border border-green-300 rounded-lg">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="mr-2 size-4"
            />
            <strong>{success}</strong>
          </div>
        )}
        <form className="space-y-4" onSubmit={forgetme_form_submission_handler}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600">
              Email 
            </label>
            <input
              type="email"
              id="email"
              required
              className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Email"
              onChange={(e) => set_email(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-4 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Delete my profile 
          </button>
        </form>

      </div>
    </div>
  );
}
