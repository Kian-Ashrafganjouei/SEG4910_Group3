"use client";

import React, { useEffect, useState } from "react";

const ViewTrips: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Trips</h2>
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
        <p>No trips found.</p>
      )}
    </div>
  );
};

export default ViewTrips;
