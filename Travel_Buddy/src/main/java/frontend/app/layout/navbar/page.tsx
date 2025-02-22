import React, { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "../../styles/Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

// Define the notification type
interface Notification {
  id: number;
  message: string;
  createdAt: Date;
  status: string;
}

const Navbar = () => {
  const [isTripsDropdownOpen, setIsTripsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.email) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    if (!session?.user?.email) return;
  
    try {
      const response = await fetch(`/backend/notifications?email=${session.user.email}`);
  
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
  
      const data = await response.json();
  
      const formattedNotifications = data
        .map((notification: any) => ({
          id: notification.notificationId,
          message: notification.message,
          createdAt: new Date(notification.createdAt), // ✅ Convert string to Date
          status: notification.status,
        }))
        .sort((a: Notification, b: Notification) => b.createdAt.getTime() - a.createdAt.getTime());
  
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  
  
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/backend/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
  
      // Update notification status locally
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
  

  const toggleNotificationsDropdown = async () => {
    await fetchNotifications();
    setIsNotificationsOpen((prev) => !prev);
  };

  const closeNotificationsDropdown = () => {
    setIsNotificationsOpen(false);
  };

  const toggleTripsDropdown = () => {
    setIsTripsDropdownOpen((prev) => !prev);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" }); // Explicitly redirect to the root page after sign-out
  };

  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: "/home" }); // Redirect to /home after sign in
  };

  const unreadCount = notifications.filter(n => n.status === "unread").length;

  return (
    <div>
      <div className="navbar fixed w-full top-0 left-0 z-10 border-b border-slate-300">
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
                <div className="relative">
                  <button
                    className="relative group "
                    onClick={toggleTripsDropdown}>
                    <span className="hover-underline-animation">Trips</span>
                  </button>
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
                      <a
                        href="/trips/profile"
                        className="block px-4 py-2 hover:bg-gray-100 text-black">
                        My Profile View
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
          <div className="hidden md:flex justify-end items-center space-x-4 relative">
            {session && (
              <div className="relative flex items-center">
                {unreadCount > 0 && (
                  <span className="absolute -left-3 -top-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
                <button onClick={toggleNotificationsDropdown} className="relative ml-6">
                  <FontAwesomeIcon icon={faBell} className="text-gray-700 text-xl hover:text-black" />
                </button>

                {isNotificationsOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-60 bg-white border shadow-md rounded-md z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                
                    {notifications.length > 0 ? (
                      <ul className="p-2 space-y-2">
                        {notifications.map((notification) => (
                          <li
                            key={notification.id}
                            className={`px-3 py-2 border-b last:border-b-0 text-sm cursor-pointer ${
                              notification.status === "unread" ? "font-bold text-black" : "text-gray-600"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationAsRead(notification.id);
                            }}
                          >
                            <p className="text-xs text-gray-500">
                              {notification.createdAt.toLocaleString()} {/* Show formatted date & time */}
                            </p>
                            <p>{notification.message}</p>
                          </li>
                        ))}
                      </ul>                    
                    ) : (
                      <p className="p-3 text-gray-500 text-sm">No new notifications</p>
                    )}
                  </div>
                )}
              </div>
            )}
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
