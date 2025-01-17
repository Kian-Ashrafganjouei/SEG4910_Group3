"use client";

import NavbarLayout from "../../components/NavbarLayout";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../layout/navbar/page";
import Footer from "../../layout/footer/page";
import Select from "react-select";
import { useDropzone } from "react-dropzone";

interface Trip {
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  interests: string[]; // Define interests as an array of strings
}

export default function AddTrip() {
  const { data: session } = useSession();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip>({
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    interests: [],
  });

  const staticInterests = [
    { value: "hiking", label: "Hiking" },
    { value: "photography", label: "Photography" },
    { value: "gaming", label: "Gaming" },
    { value: "cooking", label: "Cooking" },
    { value: "reading", label: "Reading" },
    { value: "traveling", label: "Traveling" },
    { value: "sports", label: "Sports" },
    { value: "sightseeing", label: "Sightseeing" },
    { value: "local cuisine", label: "Local Cuisine" },
    { value: "cultural tours", label: "Cultural Tours" },
    { value: "adventure sports", label: "Adventure Sports" },
    { value: "wildlife safari", label: "Wildlife Safari" },
    { value: "beach activities", label: "Beach Activities" },
    { value: "historical sites", label: "Historical Sites" },
    { value: "shopping", label: "Shopping" },
    { value: "nightlife", label: "Nightlife" },
    { value: "cruises", label: "Cruises" },
  ];

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchInterests = async () => {
  //     try {
  //       const response = await fetch("http://localhost:8080/backend/interests");
  //       if (!response.ok) throw new Error("Failed to fetch interests.");

  //       const data = await response.json();
  //       setInterests(data);
  //       setIsLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching interests:", error);
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchInterests();
  // }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTrip((prevTrip) => ({ ...prevTrip, [name]: value }));
  };

  const [files, setFiles] = useState<File[]>([]);

  // When files are dropped or selected, store them in state
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    onDragEnter: () => {}, // Optional: handle drag enter event
    onDragOver: () => {}, // Optional: handle drag over event
    onDragLeave: () => {},
  });

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

      for (var i in tripData.interests) {
        console.log(`-->  ${i}`);
      }

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
      <div className="main-div grid grid-cols-5 justify-center">
        {/* Drag and Drop images for the trip */}
        <div className="image-form bg-orange-100 col-span-3 p-10 flex items-center">
          <div className="image-drop-zone p-10 bg-white rounded-lg flex-auto">
            {/* Large drop area */}
            <div
              {...getRootProps()}
              className="relative w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <input {...getInputProps()} />

              {/* Icon & text */}
              <div className="flex flex-col items-center">
                {/* Replace with your own icon if you like */}
                <div className="bg-gray-200 rounded-full p-4 mb-4">
                  <svg
                    className="h-8 w-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>

                {isDragActive ? (
                  <p className="text-gray-700 font-medium">
                    Drop the files here ...
                  </p>
                ) : (
                  <>
                    <p className="text-gray-700 font-medium">Upload images</p>
                    <p className="text-sm text-gray-500">
                      or use Drag &amp; Drop
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Previews */}
            <div className="flex mt-4 gap-4">
              {files.map((file, idx) => {
                const previewUrl = URL.createObjectURL(file);
                return (
                  <div
                    key={idx}
                    className="w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                    <img
                      src={previewUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Form for trip detail */}
        <div className="form-container bg-orange-50 col-span-2 p-10 ">
          <h2 className="heading">Trip Information</h2>
          <form onSubmit={handleSubmit} className="grid grid-rows-6 gap-3">
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

            <div className="form-group ">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={trip.description}
                onChange={handleChange}
                placeholder="Describe your trip"
              />
            </div>

            {/* Interests Dropdown */}
            <div className="form-group">
              <label>Interests</label>
              <div className="input-field">
                <Select
                  options={staticInterests}
                  isMulti
                  value={selectedInterests}
                  onChange={(newSelected) => {
                    setSelectedInterests(newSelected || []);
                    setTrip((prev) => ({
                      ...prev,
                      interests: (newSelected || []).map(
                        (interest) => interest.value
                      ),
                    }));
                  }}
                  placeholder="Select your interests"
                />
              </div>
            </div>

            {errorMessage && <p className="error-msg">{errorMessage}</p>}

            <div className="grid justify-end">
              <button
                type="submit"
                className="submit-button w-28 h-12 text-l font-bold bg-white text-purple-500 rounded-lg hover:bg-purple-500 hover:text-white hover:border-2  border-2 border-purple-500">
                Add Trip
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          background-color: white;
          padding: 0.8rem;
          border-radius: 8px;
          font-size: 1rem;
          color: #000;
        }

        .heading {
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 600;
          font-size: 1.8rem;
        }

        input,
        textarea {
          width: 100%;
          padding: 0.8rem;
          border-radius: 8px;
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
