import React, { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "../../styles/Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

// Define the structure of a notification
interface Notification {
  id: number;
  message: string;
  createdAt: Date;
  status: string; // "unread" or "read"
}

const Navbar = () => {
  // State for dropdowns and notifications
  const [isTripsDropdownOpen, setIsTripsDropdownOpen] = useState(false); // Controls trips dropdown visibility
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // Controls notifications dropdown visibility
  const [notifications, setNotifications] = useState<Notification[]>([]); // Stores notifications
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // Controls profile dropdown visibility

  const { data: session } = useSession(); // Get the current user session
  const router = useRouter(); // Router instance for navigation

  // Fetch notifications when the session is available
  useEffect(() => {
    if (session?.user?.email) {
      fetchNotifications();
    }
  }, [session]);

  // Function to fetch notifications from the backend
  const fetchNotifications = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch(
        `/backend/notifications?email=${session.user.email}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      // Format notifications and sort by creation date (newest first)
      const formattedNotifications = data
        .map((notification: any) => ({
          id: notification.notificationId,
          message: notification.message,
          createdAt: new Date(notification.createdAt), // Convert string to Date
          status: notification.status,
        }))
        .sort(
          (a: Notification, b: Notification) =>
            b.createdAt.getTime() - a.createdAt.getTime()
        );

      setNotifications(formattedNotifications); // Update notifications state
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Function to mark a notification as read
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `/backend/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      // Update the notification status locally
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, status: "read" }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Toggle notifications dropdown and fetch notifications
  const toggleNotificationsDropdown = async () => {
    await fetchNotifications();
    setIsNotificationsOpen((prev) => !prev);
  };

  // Close notifications dropdown
  const closeNotificationsDropdown = () => {
    setIsNotificationsOpen(false);
  };

  // Toggle trips dropdown
  const toggleTripsDropdown = () => {
    setIsTripsDropdownOpen(!isTripsDropdownOpen);
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Handle user sign-out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" }); // Redirect to the root page after sign-out
  };

  // Handle user sign-in
  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: "/home" }); // Redirect to /home after sign in
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  return (
    <div className="navbar fixed w-full top-0 left-0 z-10 border-b border-slate-300">
      {/* Navbar Container */}
      <div className="grid grid-cols-2 md:grid-cols-12 items-center h-16 bg-white text-black">
        {/* Platform Name */}
        <div className="platform-name text-xl font-bold col-span-1 flex justify-center">
          <a href="/">
            <h1 className="text-2xl ">TRACO</h1>
          </a>
        </div>

        {/* Left Links Section */}
        <div className="left-links col-span-6 flex space-x-10 relative pl-9">
          {/* Home Link */}
          <div className="home">
            <a href="/home" className="relative group">
              <span className="hover-underline-animation">Trips</span>
            </a>
          </div>

          {/* My Trips Link */}
          <div className="my-trips">
            <a
              href="/trips/mytrips"
              onClick={(e) => {
                if (!session) {
                  e.preventDefault();
                  // Redirect to sign-in, then to /trips/mytrips
                  signIn(undefined, { callbackUrl: "/trips/mytrips" });
                }
              }}
              className="relative group">
              <span className="hover-underline-animation">My Trips</span>
            </a>
          </div>

          {/* Create Trip Link */}
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

          {/* Friends Link */}
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

        {/* White Space */}
        <div className="white-space col-span-1"></div>

        {/* Right Links Section */}
        <div className="right-links flex space-x-10 col-span-4 justify-end pr-9 items-center">
          {/* Profile Link */}
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

          {/* About Link */}
          <div className="about-button">
            <a href="/about" className="relative group">
              <span className="hover-underline-animation">About</span>
            </a>
          </div>

          {/* Contact Link */}
          <div className="contact-button">
            <a href="/contact" className="relative group">
              <span className="hover-underline-animation">Contact</span>
            </a>
          </div>

          {/* Notifications Section */}
          {session && (
            <div className=" notification-bell flex justify-center">
              {/* Unread Notification Count */}
              {unreadCount > 0 && (
                <span className="-left-3 -top-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}

              {/* Notification Bell Icon */}
              <button
                onClick={toggleNotificationsDropdown}
                className="bell-icon-button">
                <FontAwesomeIcon
                  icon={faBell}
                  className="text-gray-700 text-xl hover:text-black"
                />
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-60 bg-white border shadow-md rounded-md z-30"
                  onClick={(e) => e.stopPropagation()}>
                  {notifications.length > 0 ? (
                    <ul className="p-2 space-y-2 max-h-60 overflow-y-auto">
                      {" "}
                      {/* Apply scrolling */}
                      {notifications.map((notification) => (
                        <li
                          key={notification.id}
                          className={`px-3 py-2 border-b last:border-b-0 text-sm cursor-pointer ${
                            notification.status === "unread"
                              ? "font-bold text-black"
                              : "text-gray-600"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(notification.id);
                          }}>
                          <p className="text-xs text-gray-500">
                            {notification.createdAt.toLocaleString()}{" "}
                            {/* Show formatted date & time */}
                          </p>
                          <p>{notification.message}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-3 text-gray-500 text-sm">
                      No new notifications
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sign In/Sign Out Button */}
          <div className="hidden md:flex justify-end items-center space-x-4 relative">
            {session ? ( // If session is active, show Sign Out button
              <button
                onClick={handleSignOut}
                className="hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded border-2 border-black">
                Sign Out
              </button>
            ) : (
              // If session is not active, show Sign In button
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
