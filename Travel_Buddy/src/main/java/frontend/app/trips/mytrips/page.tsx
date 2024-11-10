"use client";

import NavbarLayout from "../../components/NavbarLayout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../../layout/navbar/page";
import Footer from "../../layout/footer/page";
import { useSession } from "next-auth/react";

interface Trip {
  tripId: number;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  interests: { interestId: number; name: string }[];
}

export default function ViewTrips() {
  const { data: session } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:8080/backend/trips/created", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Email: session?.user?.email || "",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch trips.");
        }

        const data: Trip[] = await response.json();

        if (data.length === 0) {
          setErrorMessage(
            `You (${session?.user?.username || "User"}) with email (${session?.user?.email || "unknown"}) have no trips posted.`
          );
        } else {
          setTrips(data);
          setErrorMessage(null);
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
      const response = await fetch(`http://localhost:8080/backend/trips/${tripId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Email: session?.user?.email || "", // Include email from session
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete the trip.");
      }
  
      // Update the state to remove the deleted trip
      setTrips(trips.filter((trip) => trip.tripId !== tripId));
      alert("Trip deleted successfully.");
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("An error occurred while deleting the trip.");
    }
  };  

  return (
    <div className="mt-16">
      <Navbar />
        <div className="trips-container">
          <h1 className="title">My Trips</h1>
          {isLoading ? (
            <p className="loading-msg">Loading trips...</p>
          ) : errorMessage ? (
            <p className="error-msg">{errorMessage}</p>
          ) : trips.length > 0 ? (
            <div className="trip-list">
              {trips.map((trip) => (
                <div key={trip.tripId} className="trip-card">
                  <h2 className="trip-location">{trip.location}</h2>
                  <p className="trip-dates">
                    {trip.startDate} to {trip.endDate}
                  </p>
                  <p className="description">{trip.description}</p>
                  {trip.interests && trip.interests.length > 0 && (
                    <div className="interests">
                      <h3>Interests:</h3>
                      <ul>
                        {trip.interests.map((interest) => (
                          <li key={interest.interestId}>{interest.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditTrip(trip.tripId)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTrip(trip.tripId)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-trips-msg">No trips found.</p>
          )}
        </div>

        <style jsx>{`
          .trips-container {
            max-width: 800px;
            margin: 3rem auto;
            padding: 2rem;
            background-color: #ede7f6;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            font-family: "Poppins", sans-serif;
          }

          .title {
            text-align: center;
            font-size: 3rem;
            color: #512da8;
            margin-bottom: 2rem;
            font-weight: 700;
          }

          .trip-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .trip-card {
            background-color: #f8f9fa;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .trip-card:hover {
            transform: scale(1.02);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
          }

          .trip-location {
            font-size: 1.8rem;
            color: #00bfa6;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }

          .trip-dates {
            font-size: 1.2rem;
            color: #9ac0b6;
            margin-bottom: 1rem;
            font-weight: 500;
          }

          .description {
            color: #6a1b9a;
            font-size: 1.2rem;
            margin: 0;
          }

          .edit-button,
          .delete-button {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            font-size: 1rem;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }

          .edit-button {
            background-color: #512da8;
          }

          .edit-button:hover {
            background-color: #3e1d9d;
          }

          .delete-button {
            background-color: #d32f2f;
            margin-left: 0.5rem;
          }

          .delete-button:hover {
            background-color: #b71c1c;
          }

          .loading-msg,
          .no-trips-msg,
          .error-msg {
            text-align: center;
            font-size: 1.3rem;
            margin-top: 1rem;
          }

          .error-msg {
            color: #d32f2f;
          }

          .interests {
            margin-top: 1rem;
            font-size: 1.1rem;
          }

          .interests h3 {
            font-weight: 600;
            color: #512da8;
            margin-bottom: 0.5rem;
          }

          .interests ul {
            padding-left: 1.5rem;
          }

          .interests li {
            list-style-type: disc;
            color: #6a1b9a;
          }
        `}</style>
      <Footer />
    </div>
  );
}
