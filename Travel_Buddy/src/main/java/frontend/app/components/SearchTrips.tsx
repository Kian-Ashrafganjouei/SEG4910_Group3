"use client";

import React, { useState, useEffect } from "react";

const SearchTrips: React.FC = () => {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [interest, setInterest] = useState("");
  const [interestOptions, setInterestOptions] = useState<string[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(
      `/api/searchTrips?location=${location}&date=${date}&interest=${interest}`
    );
    const data = await response.json();
    setTrips(data);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Search for Trips</h2>
      <form onSubmit={handleSearch} className="space-y-4">
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <select
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select an Interest</option>
          {interestOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          Search
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Results</h3>
        {trips.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {trips.map((trip) => (
              <li key={trip.trip_id} className="p-4 border rounded shadow-sm">
                <h4 className="text-lg font-bold">{trip.location}</h4>
                <p>{trip.description}</p>
                <p>{trip.start_date} - {trip.end_date}</p>
                <p>Interests: {trip.interests.join(", ")}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No trips found with the selected criteria.</p>
        )}
      </div>
    </div>
  );
};

export default SearchTrips;
