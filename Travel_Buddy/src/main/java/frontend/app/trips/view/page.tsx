"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faSort, faFilter } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

interface User {
  userId: number;
  username: string;
  name: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  languages: string[];
  age: number;
  sex: string;
  interests: string[];
  bio: string;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
}

interface Trip {
  tripId: number;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export default function ViewTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: session } = useSession();
  const [requested, setRequested] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:8080/backend/trips");
        if (!response.ok) {
          throw new Error("Failed to fetch trips.");
        }
        const data = await response.json();
        setTrips(data);
      } catch (error) {
        console.error("Error fetching trips:", error);
        setErrorMessage("An error occurred while fetching trips.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleRequestToggle = (tripId: number) => {
    setRequested((oldVal) => ({
      ...oldVal,
      [tripId]: !oldVal[tripId]
    }));
  };

  return (
    <div>
      <div className="trips-container block m-auto max-w-[800px]">
        <div id="searchSortFilterComponent" className="flex mb-3">
          <div id="searchComponent" className="relative flex flex-auto mr-2.5 border border-lightgray-600 rounded"
              data-twe-input-wrapper-init
              data-twe-input-group-ref>
            <input type="search"
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                  placeholder="Search"
                  id="search-input" />
            <label htmlFor="search-input"
                  className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[twe-input-state-active]:-translate-y-[0.9rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none">
              Search
            </label>
            <button className="border border-lightgray-600 rounded relative z-[2] -ms-0.5 flex items-center bg-primary px-5 text-xs shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2"
                    type="button"
                    id="search-button"
                    data-twe-ripple-init
                    data-twe-ripple-color="light">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500" />
            </button>
          </div>
          <div id="sortAndfilterComponent" className="float-right">
            <button type="button" className="h-full ml-2.5 px-2 py-1 group flex items-center inline-center inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900" id="menu-button" aria-expanded="false" aria-haspopup="true">
                <FontAwesomeIcon icon={faSort} className="text-gray-500 px-1.5 items-center" />
                Sort
              </button>
            <button type="button" className="h-full ml-2.5 px-2 py-1 group flex items-center inline-center inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900" id="menu-button" aria-expanded="false" aria-haspopup="true">
                <FontAwesomeIcon icon={faFilter} className="text-gray-500 px-1.5 items-center" />
                Filter
              </button>
          </div>

        </div>


          {isLoading ? (
            <p className="loading-msg">Loading trips...</p>
          ) : errorMessage ? (
            <p className="error-msg">{errorMessage}</p>
          ) : trips.length > 0 ? (
            <div className="">
              {trips.map((trip) => (
                <div key={trip.tripId} className="block mb-3.5 w-full rounded-lg border border-lightgray-600 bg-white shadow-secondary-1">
                  <div className="flex border-b border-gray-300 px-6 py-3 text-surface h-[max-content]" style={{color: "black"}}>
                    <span className="flex-auto py-1">@{trip.createdBy.username}</span>
                    <button onClick={() => handleRequestToggle(trip.tripId)} 
                            className={`float-right py-1 px-2 font-semibold rounded border transition ${
                              requested[trip.tripId]
                                ? "bg-transparent text-blue-700 border-blue-500 hover:bg-blue-50"
                                : "bg-blue-500 text-white border-transparent hover:bg-blue-600"
                            }`}>
                      {requested[trip.tripId] ? "Cancel Request" : "Request Join"}
                    </button>
                    
                  </div>
                  <div className="block p-6">
                    <div className="flex">
                      <h2 className="flex-auto mb-2 text-xl font-medium leading-tight text-secondary-600">{trip.location}</h2>
                      <p className="float-right text-base text-secondary-600">
                        {moment(trip.startDate).format('MMM D, YYYY')} to {moment(trip.endDate).format('MMM D, YYYY')}
                      </p>
                    </div>
                    <p className="w-full text-base text-secondary-600">{trip.description}</p>                    
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-trips-msg">No trips available.</p>
          )}
        </div>

        <style jsx>{`
        `}</style>
    </div>
  );
}
