"use client";

import React, { useState, useEffect } from "react";

const PostTrip: React.FC = () => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestOptions, setInterestOptions] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tripData = {
      location,
      startDate,
      endDate,
      description,
      interests: selectedInterests,
    };

    await fetch("/api/postTrip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tripData),
    });

    setLocation("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setSelectedInterests([]);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Post a New Trip</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <select
          multiple
          value={selectedInterests}
          onChange={(e) => setSelectedInterests(Array.from(e.target.selectedOptions, option => option.value))}
          className="w-full p-2 border rounded"
        >
          {interestOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded">
          Post Trip
        </button>
      </form>
    </div>
  );
};

export default PostTrip;
