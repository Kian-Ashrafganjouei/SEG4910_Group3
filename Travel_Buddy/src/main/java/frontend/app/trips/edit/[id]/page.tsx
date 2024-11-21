"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../../../layout/navbar/page";
import Footer from "../../../layout/footer/page";

interface Trip {
  tripId: number;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  interests: { interestId: number; name: string }[];
}

export default function EditTrip({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await fetch(
          `http://docker-backend-1:8080/backend/trips/${params.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch trip data.");

        const data = await response.json();
        setTrip(data);
      } catch (error) {
        console.error("Error fetching trip:", error);
        setErrorMessage("Could not load trip data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [params.id]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (trip) {
      const { name, value } = event.target;
      setTrip({ ...trip, [name]: value });
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://docker-backend-1:8080/backend/trips/${params.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trip),
        }
      );

      if (response.status === 200) {
        alert("Trip updated successfully!");
        router.push("/trips/mytrips");
      } else {
        const result = await response.json();
        console.error("Error message:", result.message);
        throw new Error(result.message || "Failed to save trip data.");
      }
    } catch (error) {
      console.error("Error updating trip:", error);
      setErrorMessage("Could not save trip data.");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!trip) return <p>{errorMessage || "Trip not found"}</p>;

  return (
    <div className="mt-16">
      <Navbar />
      <div className="flex justify-center">
        <div className="edit-trip-container w-6/12 p-8 m-12 rounded-2xl bg-violet-200">
          <h1>Edit Trip</h1>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={trip.location}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={trip.startDate}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={trip.endDate}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={trip.description}
              onChange={handleInputChange}
              className="textarea-field"
            />
          </div>

          <div className="button-group">
            <button onClick={handleSave} className="save-button">
              Save Changes
            </button>
            <button onClick={() => router.back()} className="cancel-button">
              Go Back
            </button>
          </div>

          {errorMessage && <p className="error-msg">{errorMessage}</p>}
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .edit-trip-container {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          font-family: "Poppins", sans-serif;
          color: #333;
        }

        h1 {
          font-size: 2rem;
          color: #333;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          font-size: 1.1rem;
          color: #555;
          margin-bottom: 0.5rem;
          display: block;
        }

        .input-field,
        .textarea-field {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .textarea-field {
          resize: vertical;
          height: 100px;
        }

        .button-group {
          display: flex;
          justify-content: space-between;
          margin-top: 1.5rem;
        }

        .save-button,
        .cancel-button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s;
          flex: 1;
          margin: 0 5px;
        }

        .save-button {
          background-color: #28a745;
        }

        .save-button:hover {
          background-color: #218838;
        }

        .cancel-button {
          background-color: #6c757d;
        }

        .cancel-button:hover {
          background-color: #5a6268;
        }

        .error-msg {
          color: #d32f2f;
          text-align: center;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
