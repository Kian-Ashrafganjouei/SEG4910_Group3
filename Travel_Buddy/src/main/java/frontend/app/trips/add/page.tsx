"use client";

import NavbarLayout from "../../components/NavbarLayout";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AddTrip() {
  const { data: session } = useSession();
  const router = useRouter();

  const [trip, setTrip] = useState({
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTrip((prevTrip) => ({ ...prevTrip, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
  
    if (new Date(trip.startDate) > new Date(trip.endDate)) {
      setErrorMessage("End date must be after the start date.");
      return;
    }
  
    try {
      const tripData = {
        ...trip,
        createdByEmail: session?.user?.email,  // Ensure the correct user email is sent
      };
  
      console.log("Sending trip data to backend:", tripData);  // Log the request data
  
      const response = await fetch("http://localhost:8080/backend/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(errorData.message || "Failed to add trip.");
      }
  
      alert("Trip added successfully!");
      router.push("/trips/view");
    } catch (error) {
      console.error("Error adding trip:", error);
      setErrorMessage("An error occurred while adding the trip.");
    }
  };
  

  return (
    <NavbarLayout>
      <div className="form-container">
        <h2 className="heading">Add a New Trip</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={trip.location}
              onChange={handleChange}
              required
              placeholder="Enter trip location"
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={trip.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={trip.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={trip.description}
              onChange={handleChange}
              placeholder="Describe your trip"
            />
          </div>

          {errorMessage && <p className="error-msg">{errorMessage}</p>}

          <button type="submit" className="submit-button">
            Add Trip
          </button>
        </form>
      </div>

      <style jsx>{`
        .form-container {
          max-width: 600px;
          margin: 3rem auto;
          padding: 2rem;
          background-color: #ede7f6;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          font-family: 'Poppins', sans-serif;
          color: #4a148c;
        }
        .heading {
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 600;
          font-size: 1.8rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        input,
        textarea {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #b39ddb;
          border-radius: 8px;
          margin-top: 0.5rem;
        }
        input:focus,
        textarea:focus {
          outline: none;
          border-color: #7b1fa2;
          box-shadow: 0 0 4px #b39ddb;
        }
        .submit-button {
          width: 100%;
          padding: 1rem;
          background-color: #7b1fa2;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .submit-button:hover {
          background-color: #4a148c;
        }
        .error-msg {
          color: #d32f2f;
          text-align: center;
          margin-top: 1rem;
        }
      `}</style>
    </NavbarLayout>
  );
}
