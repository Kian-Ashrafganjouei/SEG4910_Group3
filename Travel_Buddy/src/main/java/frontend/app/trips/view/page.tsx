"use client";

import NavbarLayout from "../../components/NavbarLayout";
import { useEffect, useState } from "react";
import Navbar from "../../layout/navbar/page";
import Footer from "../../layout/footer/page";

interface Trip {
  tripId: number;
  location: string;  
  startDate: string;  // Format: YYYY-MM-DD
  endDate: string;    // Format: YYYY-MM-DD
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
  const [selectedStartDate, setSelectedStartDate] = useState<string>("");  // Start date filter
  const [selectedEndDate, setSelectedEndDate] = useState<string>("");      // End date filter
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);

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

        // Extract unique locations for the location filter
        const uniqueLocations = Array.from(new Set(data.map((trip: Trip) => trip.location)));
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
    // Filter trips based on selected interests, location, and date range
    setFilteredTrips(
      trips.filter((trip) => {
        const matchesInterests =
          selectedInterests.length === 0 ||
          trip.interests.some((interest) => selectedInterests.includes(interest.interestId));

        const matchesLocation = selectedLocation === "" || trip.location === selectedLocation;

        // Apply date filtering only if both start and end dates are selected
        const matchesDateRange = selectedStartDate !== "" && selectedEndDate !== ""
          ? (new Date(trip.startDate) <= new Date(selectedEndDate) &&
             new Date(trip.endDate) >= new Date(selectedStartDate)) ||
            (new Date(trip.startDate) > new Date(selectedStartDate) &&
             new Date(trip.endDate) < new Date(selectedEndDate))
          : true;  // If no date range is selected, ignore date filter

        return matchesInterests && matchesLocation && matchesDateRange;
      })
    );
  }, [selectedInterests, selectedLocation, selectedStartDate, selectedEndDate, trips]);

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

  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(event.target.value);
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEndDate(event.target.value);
  };

  return (
    <div>
      <Navbar />

      <NavbarLayout>
        <div className="trips-container">
          <h1 className="title">Explore Trips</h1>

          {/* Filters Container */}
          <div className="filters-container">
            {/* Interest Multi-Select Checkbox Dropdown */}
            <div className="filter-item">
              <label className="filter-label">Filter by Interests:</label>
              <div className="multi-select-dropdown">
                <button onClick={toggleInterestDropdown} className="dropdown-toggle">
                  Select Interests
                </button>
                {showInterestDropdown && (
                  <div className="dropdown-menu">
                    {interests.map((interest) => (
                      <label key={interest.interestId} className="dropdown-item">
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
                )}
              </div>
            </div>

            {/* Location Filter */}
            <div className="filter-item">
              <label htmlFor="location-filter" className="filter-label">
                Filter by Location:
              </label>
              <select
                id="location-filter"
                value={selectedLocation}
                onChange={handleLocationChange}
                className="location-select"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
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

            {/* End Date Filter */}
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
                min={selectedStartDate || undefined} // Only set min if start date is selected
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

          .filters-container {
            display: flex;
            justify-content: space-between;
            gap: 2rem;
            margin-bottom: 1.5rem;
          }

          .filter-item {
            flex: 1;
          }

          .filter-label {
            font-weight: 600;
            color: #512da8;
            margin-bottom: 1rem;
            display: block;
          }

          .multi-select-dropdown {
            position: relative;
          }

          .dropdown-toggle {
            width: 100%;
            padding: 0.5rem;
            font-size: 1rem;
            border-radius: 8px;
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            cursor: pointer;
          }

          .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1;
          }

          .dropdown-item {
            display: flex;
            align-items: center;
            padding: 0.5rem;
            font-size: 1rem;
            color: #333;
          }

          .location-select,
          .date-select {
            width: 100%;
            padding: 0.5rem;
            font-size: 1rem;
            border-radius: 8px;
            margin-top: 0.5rem;
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
