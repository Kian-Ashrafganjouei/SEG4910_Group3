"use client";

import NavbarLayout from "../../components/NavbarLayout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedStartDate, setSelectedStartDate] = useState<string>("");
  const [selectedEndDate, setSelectedEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:8080/backend/trips");
        if (!response.ok) throw new Error("Failed to fetch trips");

        const data = await response.json();
        setTrips(data);
        setFilteredTrips(data);

        const uniqueLocations = Array.from(
          new Set(data.map((trip: Trip) => trip.location))
        );
        setLocations(uniqueLocations);
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
        if (!response.ok) throw new Error("Failed to fetch interests.");

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
    setFilteredTrips(
      trips.filter((trip) => {
        const matchesInterests =
          selectedInterests.length === 0 ||
          trip.interests.some((interest) =>
            selectedInterests.includes(interest.interestId)
          );

        const matchesLocation =
          selectedLocation === "" || trip.location === selectedLocation;

        const matchesDateRange =
          selectedStartDate !== "" && selectedEndDate !== ""
            ? (new Date(trip.startDate) <= new Date(selectedEndDate) &&
                new Date(trip.endDate) >= new Date(selectedStartDate)) ||
              (new Date(trip.startDate) > new Date(selectedStartDate) &&
                new Date(trip.endDate) < new Date(selectedEndDate))
            : true;

        return matchesInterests && matchesLocation && matchesDateRange;
      })
    );
  }, [
    selectedInterests,
    selectedLocation,
    selectedStartDate,
    selectedEndDate,
    trips,
  ]);

  const toggleInterestDropdown = () => {
    setShowInterestDropdown(!showInterestDropdown);
  };

  const handleInterestChange = (interestId: number) => {
    setSelectedInterests((prevSelected) =>
      prevSelected.includes(interestId)
        ? prevSelected.filter((id) => id !== interestId)
        : [...prevSelected, interestId]
    );
  };

  const handleLocationChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedLocation(event.target.value);
  };

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEndDate(event.target.value);
  };

  return (
    <div className="mt-16">
      <Navbar />
      <div className="flex justify-center">
        <div className="trips-container w-6/12 p-8 m-12 rounded-2xl bg-violet-200">
          <h1 className="title">Explore Trips</h1>

          <div className="filters-container">
            <div className="filter-item">
              <label className="filter-label">Filter by Interests:</label>
              <div className="multi-select-dropdown">
                <button
                  onClick={toggleInterestDropdown}
                  className="dropdown-toggle">
                  Select Interests
                </button>
                {showInterestDropdown && (
                  <div className="dropdown-menu">
                    {interests.map((interest) => (
                      <label
                        key={interest.interestId}
                        className="dropdown-item">
                        <input
                          type="checkbox"
                          value={interest.interestId}
                          checked={selectedInterests.includes(
                            interest.interestId
                          )}
                          onChange={() =>
                            handleInterestChange(interest.interestId)
                          }
                        />
                        {interest.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="filter-item">
              <label htmlFor="location-filter" className="filter-label">
                Filter by Location:
              </label>
              <select
                id="location-filter"
                value={selectedLocation}
                onChange={handleLocationChange}
                className="location-select">
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="start-date-filter" className="filter-label">
                Filter by Start Date:
              </label>
              <input
                type="date"
                id="start-date-filter"
                value={selectedStartDate}
                onChange={handleStartDateChange}
                className="date-select"
              />
            </div>

            <div className="filter-item">
              <label htmlFor="end-date-filter" className="filter-label">
                Filter by End Date:
              </label>
              <input
                type="date"
                id="end-date-filter"
                value={selectedEndDate}
                onChange={handleEndDateChange}
                className="date-select"
                min={selectedStartDate || undefined}
              />
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
      </div>

      <style jsx>{`
        .trips-container {
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
