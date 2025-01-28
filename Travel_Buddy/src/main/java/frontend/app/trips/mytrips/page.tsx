"use client";

import Navbar from "../../layout/navbar/page";
import Footer from "../../layout/footer/page";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faE, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

interface Trip {
  tripId: number;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  interests: { interestId: number; name: string }[];
}

interface Request {
  userTripId: number;
  username: string;
  status: string;
  userId: number;
}

export default function MyTrips() {
  const { data: session } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [requests, setRequests] = useState<{ [tripId: number]: Request[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRequests = async (tripIds: number[]) => {
    try {
      const requestsByTrip: { [tripId: number]: Request[] } = {};
      for (const tripId of tripIds) {
        const response = await fetch(
          `/backend/trips/${tripId}/requests`
        );
        if (!response.ok) {
          console.error(`Failed to fetch requests for tripId: ${tripId}`);
          continue;
        }
        const data: Request[] = await response.json();
        requestsByTrip[tripId] = data;
      }
      setRequests(requestsByTrip);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch(
          "/backend/trips/created",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Email: session?.user?.email || "",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trips.");
        }

        const data: Trip[] = await response.json();

        if (data.length === 0) {
          setErrorMessage(
            `You (${session?.user?.username || "User"}) with email (${
              session?.user?.email || "unknown"
            }) have no trips posted.`
          );
        } else {
          setTrips(data);
          setErrorMessage(null);
          await fetchRequests(data.map((trip) => trip.tripId));
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
        setErrorMessage("An error occurred while fetching trips.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [session]);

  const handleEditTrip = (tripId: number) => {
    router.push(`/trips/edit/${tripId}`);
  };

  const handleDeleteTrip = async (tripId: number) => {
    const confirmed = confirm("Are you sure you want to delete this trip?");
    if (!confirmed) return;

    try {
      const response = await fetch(
        `/backend/trips/${tripId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Email: session?.user?.email || "", // Include email from session
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete the trip.");
      }

      setTrips(trips.filter((trip) => trip.tripId !== tripId));
      alert("Trip deleted successfully.");
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("An error occurred while deleting the trip.");
    }
  };

  const handleRequestAction = async (userTripId: number, status: string) => {
    try {
      const response = await fetch(
        `/backend/user-trips/${userTripId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        throw new Error("Failed to update the request status.");
      }

      alert(`Request status updated to ${status}.`);
      const updatedTrips = trips.map((trip) => trip.tripId);
      await fetchRequests(updatedTrips);
    } catch (error) {
      console.error("Error updating request status:", error);
      alert("An error occurred while updating the request status.");
    }
  };

  return (
    <div className="mt-16">
      <Navbar />
      <div className="flex justify-center">
        <div className="trips-container trips-container block m-auto max-w-[800px] mt-7 mb-6"> 
          <h1 className="title text-center text-4xl font-bold mb-8">
            My Trips
          </h1>
          {isLoading ? (
            <p className="loading-msg text-center text-xl font-semibold">
              Loading trips...
            </p>
          ) : errorMessage ? (
            <p className="error-msg text-center text-xl text-red-300">
              {errorMessage}
            </p>
          ) : trips.length > 0 ? (
            <div className="trip-list space-y-6">
              {trips.map((trip) => (
                <div
                  key={trip.tripId}
                  className="block mb-3.5 w-full rounded-lg border border-lightgray-600 bg-white shadow-secondary-1"
                >
                  <div className="flex border-b border-gray-300 px-6 py-3 text-surface h-[max-content]" style={{color: "black"}}>
                    <span className="flex-auto py-1 trip-location text-2xl">{trip.location}</span>
                    <span className="float-right">
                      <button
                        onClick={() => handleDeleteTrip(trip.tripId)}
                        className="px-2 py-1 text-red-600 text-lg rounded-lg hover:bg-red-700 hover:text-white"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                      <button
                          onClick={() => handleEditTrip(trip.tripId)}
                          className="ml-3 px-2 py-1 text-blue-600 text-lg rounded-lg hover:bg-blue-600 hover:text-white"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                    </span>
                  </div>
                    
                  <div className="flex justify-between p-6">               
                    <div className="trip-info w-3/5">
                      <p className="trip-dates text-lg text-gray-600 mb-4">
                        {moment(trip.startDate).format('MMM D, YYYY')} - {moment(trip.endDate).format('MMM D, YYYY')}
                      </p>
                      <p className="description text-gray-700 mb-4">
                        {trip.description}
                      </p>
                      {trip.interests && trip.interests.length > 0 && (
                        <div className="interests text-gray-700">
                          <h3 className="font-semibold mb-2">Interests:</h3>
                          <ul className="list-disc ml-6">
                            {trip.interests.map((interest) => (
                              <li key={interest.interestId}>{interest.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="requests-section w-2/5 bg-gray-100 p-4 rounded-lg">
                      <h3 className="requests-title text-lg font-bold mb-4 text-blue-800">
                        Requests
                      </h3>
                      {requests[trip.tripId]?.length > 0 ? (
                        <ul className="space-y-2">
                          {requests[trip.tripId].map((req) => (
                            <li
                              key={req.userTripId}
                              className="request-item flex justify-between items-center bg-gray-200 p-2 rounded-lg"
                            >
                              <div>
                                <span className="username font-semibold">
                                  {req.username}
                                </span>{" "}
                                <span className="status text-sm">
                                  ({req.status})
                                </span>
                              </div>
                              {req.status === "requested" && (
                                <div className="actions flex space-x-2">
                                  <button
                                    onClick={() =>
                                      handleRequestAction(req.userTripId, "joined")
                                    }
                                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-700"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRequestAction(
                                        req.userTripId,
                                        "declined"
                                      )
                                    }
                                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-700"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No requests.</p>
                      )}
                    </div>

                  </div>                     


                </div>
              ))}
            </div>
          ) : (
            <p className="no-trips-msg text-center text-xl">No trips found.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
