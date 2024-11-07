"use client";

import NavbarLayout from "../../components/NavbarLayout";
import { useEffect, useState } from "react";
import Navbar from "../../layout/navbar/page";
import Footer from "../../layout/footer/page";

interface Trip {
  tripId: number;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  interests: { interestId: number; name: string }[];
}

interface Interest {
  interestId: number;
  name: string;
}

export default function ViewTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:8080/backend/trips");
        if (!response.ok) {
          throw new Error("Failed to fetch trips.");
        }
        const data = await response.json();
        setTrips(data);
        setFilteredTrips(data); // Initialize filtered trips with all trips
      } catch (error) {
        console.error("Error fetching trips:", error);
        setErrorMessage("An error occurred while fetching trips.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchInterests = async () => {
      try {
        const response = await fetch("http://localhost:8080/backend/interests");
        if (!response.ok) {
          throw new Error("Failed to fetch interests.");
        }
        const data = await response.json();
        setInterests(data);
      } catch (error) {
        console.error("Error fetching interests:", error);
        setErrorMessage("An error occurred while fetching interests.");
      }
    };

    fetchTrips();
    fetchInterests();
  }, []);

  useEffect(() => {
    // Filter trips based on selected interests
    if (selectedInterests.length === 0) {
      setFilteredTrips(trips); // Show all trips if no interests are selected
    } else {
      setFilteredTrips(
        trips.filter((trip) =>
          trip.interests.some((interest) =>
            selectedInterests.includes(interest.interestId)
          )
        )
      );
    }
  }, [selectedInterests, trips]);

  const handleInterestChange = (interestId: number) => {
    setSelectedInterests((prevSelected) =>
      prevSelected.includes(interestId)
        ? prevSelected.filter((id) => id !== interestId)
        : [...prevSelected, interestId]
    );
  };

  return (
    <div>
      <Navbar />

      <NavbarLayout>
        <div className="trips-container">
          <h1 className="title">Explore Trips</h1>

          {/* Interest Filter */}
          <div className="filter-container">
            <label className="filter-label">Filter by Interests:</label>
            <div className="checkbox-group">
              {interests.map((interest) => (
                <label key={interest.interestId} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={interest.interestId}
                    checked={selectedInterests.includes(interest.interestId)}
                    onChange={() => handleInterestChange(interest.interestId)}
                  />
                  {interest.name}
                </label>
              ))}
            </div>
          </div>

          {isLoading ? (
            <p className="loading-msg">Loading trips...</p>
          ) : errorMessage ? (
            <p className="error-msg">{errorMessage}</p>
          ) : filteredTrips.length > 0 ? (
            <div className="trip-list">
              {filteredTrips.map((trip) => (
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
                </div>
              ))}
            </div>
          ) : (
            <p className="no-trips-msg">No trips available.</p>
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
            font-family: "Montserrat", sans-serif;
          }

          .title {
            text-align: center;
            font-size: 3rem;
            color: #512da8;
            margin-bottom: 2rem;
            font-weight: 700;
          }

          .filter-container {
            margin-bottom: 1.5rem;
            text-align: center;
          }

          .filter-label {
            font-weight: 600;
            color: #512da8;
            margin-bottom: 1rem;
            display: block;
          }

          .checkbox-group {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
          }

          .checkbox-label {
            font-size: 1rem;
            color: #6a1b9a;
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
      </NavbarLayout>
      <Footer />
    </div>
  );
}
