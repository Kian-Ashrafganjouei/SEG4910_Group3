"use client";

import NavbarLayout from "../../components/NavbarLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../layout/navbar/page";
import Footer from "../../layout/footer/page";

interface Interest {
  interestId: number;
  name: string;
}

export default function AddTrip() {
  const { data: session } = useSession();
  const router = useRouter();

  const [trip, setTrip] = useState({
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    interestIds: [] as number[],
  });

  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await fetch("http://localhost:8080/backend/interests");
        if (!response.ok) throw new Error("Failed to fetch interests.");

        const data = await response.json();
        setInterests(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching interests:", error);
        setIsLoading(false);
      }
    };

    fetchInterests();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTrip((prevTrip) => ({ ...prevTrip, [name]: value }));
  };

  const toggleInterest = (interestId: number) => {
    setTrip((prevTrip) => {
      const updatedInterests = prevTrip.interestIds.includes(interestId)
        ? prevTrip.interestIds.filter((id) => id !== interestId)
        : [...prevTrip.interestIds, interestId];
      return { ...prevTrip, interestIds: updatedInterests };
    });
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
        createdByEmail: session?.user?.email,
      };

      console.log("Sending trip data to backend:", tripData);

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
      router.push("/trips/mytrips");
    } catch (error) {
      console.error("Error adding trip:", error);
      setErrorMessage("An error occurred while adding the trip.");
    }
  };

  return (
    <div className="mt-16">
      <Navbar />
        <div className="form-container mt-16">
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

            <h3 className="interests-title">Select Interests:</h3>
            {isLoading ? (
              <p>Loading interests...</p>
            ) : (
              <div className="interests-list">
                {interests.map((interest) => (
                  <label key={interest.interestId} className="interest-label">
                    <input
                      type="checkbox"
                      checked={trip.interestIds.includes(interest.interestId)}
                      onChange={() => toggleInterest(interest.interestId)}
                    />
                    <span>{interest.name}</span>
                  </label>
                ))}
              </div>
            )}

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
            font-family: "Poppins", sans-serif;
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
          .interests-title {
            margin-top: 1rem;
            font-size: 1.5rem;
            color: #4a148c;
          }
          .interests-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px;
            margin-top: 1rem;
          }
          .interest-label {
            display: flex;
            align-items: center;
            gap: 5px;
            background-color: #e0f7fa;
            padding: 5px 10px;
            border-radius: 5px;
            transition: background-color 0.2s;
            white-space: nowrap;
          }
          .interest-label:hover {
            background-color: #b2ebf2;
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
      <Footer />
    </div>
  );
}
