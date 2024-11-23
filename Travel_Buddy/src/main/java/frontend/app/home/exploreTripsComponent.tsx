"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faSort, faFilter, faPlus, faMinus, faCalendar } from "@fortawesome/free-solid-svg-icons";
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
  interests: { interestId: number; name: string }[];
}

interface Interest {
  interestId: number;
  name: string;
}

export default function ExploreTripsComponent() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRequested, setIsRequested] = useState<Record<number, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedStartDate, setSelectedStartDate] = useState<string>("");
  const [selectedEndDate, setSelectedEndDate] = useState<string>("");
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDatesDropdown, setShowDatesDropdown] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:8080/backend/trips");
        if (!response.ok) {
          throw new Error("Failed to fetch trips.");
        }
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

  const toggleShowInterestDropdown = () => {
    setShowInterestDropdown(!showInterestDropdown);
  };

  const toggleShowLocationDropdown = () => {
    setShowLocationDropdown(!showLocationDropdown);
  };

  const toggleShowDatesDropdown = () => {
    setShowDatesDropdown(!showDatesDropdown);
  };

  const toggleShowFilters = () => {
    setShowFilters(!showFilters)
  }

  const handleInterestChange = (interestId: number) => {
    setSelectedInterests((prevSelected) =>
      prevSelected.includes(interestId)
        ? prevSelected.filter((id) => id !== interestId)
        : [...prevSelected, interestId]
    );
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEndDate(event.target.value);
  };

  const handleRequestToggle = (tripId: number) => {
    setIsRequested((oldVal) => ({
      ...oldVal,
      [tripId]: !oldVal[tripId]
    }));
  };

  return (
    <div>
      {/* <script src="/js/flowbite.min.js"></script> */}
      {/* <script src="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.js"></script> */}
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
            <button type="button" 
                    className="h-full ml-2.5 px-2 py-1 group flex items-center inline-center inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900" 
                    id="sortButton" 
                    aria-expanded="false" 
                    aria-haspopup="true">
                <FontAwesomeIcon icon={faSort} className="text-gray-500 px-1.5 items-center" />
                Sort
              </button>
            <button type="button" 
                    className="h-full ml-2.5 px-2 py-1 group flex items-center inline-center inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900" 
                    id="filterButton" 
                    onClick={toggleShowFilters}
                    aria-expanded="false" 
                    aria-haspopup="true">
                <FontAwesomeIcon icon={faFilter} className="text-gray-500 px-1.5 items-center" />
                Filter
              </button>
          </div>

        </div>


        <div id="filtersContainer" className={`${showFilters ? "" : "hidden"}`}>



        <div id="interestsFilterComponent" className="border-t border-gray-200 px-4 py-6">
          <h3 className="-mx-2 -my-3 flow-root">
            <button type="button" 
                    className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500"
                    onClick={() => toggleShowInterestDropdown()}>
              <span className="font-medium text-gray-900">Interests</span>
              <span className="ml-6 flex items-center">
                {showInterestDropdown ? <FontAwesomeIcon icon={faMinus} /> : <FontAwesomeIcon icon={faPlus} />}
              </span>
            </button>
          </h3>
          <div className={`pt-6 max-h-64 overflow-y-auto ${showInterestDropdown ? "" : "hidden"}`} id="interestsFilters">
            <div className="grid grid-cols-2 gap-4">
                  {interests.map((interest) => (
                    <div className="flex items-center">
                      <input name={`interest${interest.interestId}`} 
                             id={`interest${interest.interestId}`}
                             value={interest.interestId} 
                             type="checkbox" 
                             className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mr-1.5" 
                             checked={selectedInterests.includes(interest.interestId)}
                             onChange={() => handleInterestChange(interest.interestId)} />
                      <label htmlFor={`interest${interest.interestId}`}
                             className="ml-3 min-w-0 flex-1 text-gray-500"
                             key={interest.interestId}>
                        {interest.name}
                      </label>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        <div id="locationFilterComponent" className="border-t border-gray-200 px-4 py-6">
          <h3 className="-mx-2 -my-3 flow-root">
            <button type="button" 
                    className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500"
                    onClick={() => toggleShowLocationDropdown()}>
              <span className="font-medium text-gray-900">Locations</span>
              <span className="ml-6 flex items-center">
                {showLocationDropdown ? <FontAwesomeIcon icon={faMinus} /> : <FontAwesomeIcon icon={faPlus} />}
              </span>
            </button>
          </h3>
          <div className={`pt-6 max-h-64 overflow-y-auto ${showLocationDropdown ? "" : "hidden"}`} id="interestsFilters">
            <div className="grid grid-cols-2 gap-4">
                      <input name="location"
                             id={"locationAllLocations"}
                             value=""
                             type="radio" 
                             className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mr-1.5"
                             onChange={() => handleLocationChange("")} />
                      <label htmlFor={"locationAllLocations"}
                             className="ml-3 min-w-0 flex-1 text-gray-500" >
                        All Locations
                      </label>
                  {locations.map((location) => (
                    <div className="flex items-center">
                      <input name="location"
                             id={`location${location}`}
                             value={location} 
                             type="radio" 
                             className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mr-1.5"
                             onChange={() => handleLocationChange(location)} />
                      <label htmlFor={`location${location}`}
                             className="ml-3 min-w-0 flex-1 text-gray-500"
                             key={location}>
                        {location}
                      </label>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        <div id="datesFilterComponent" className="border-t border-gray-200 px-4 py-6">
          <h3 className="-mx-2 -my-3 flow-root">
            <button type="button" 
                    className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500"
                    onClick={() => toggleShowDatesDropdown()}>
              <span className="font-medium text-gray-900">Dates</span>
              <span className="ml-6 flex items-center">
                {showDatesDropdown ? <FontAwesomeIcon icon={faMinus} /> : <FontAwesomeIcon icon={faPlus} />}
              </span>
            </button>
          </h3>
          <div className={`pt-6 max-h-64 overflow-y-auto ${showDatesDropdown ? "" : "hidden"}`} id="interestsFilters">

            <div id="date-range-picker" className="flex items-center">
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <FontAwesomeIcon icon={faCalendar} />
                </div>
                <input id="start-date-filter" 
                       name="start" 
                       type="date" 
                       value={selectedStartDate}
                       onChange={handleStartDateChange}
                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5" 
                       placeholder="Select start date" />
              </div>
              <span className="mx-4 text-gray-500">to</span>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <FontAwesomeIcon icon={faCalendar} />
                </div>
                <input id="end-date-filter" 
                       name="end" 
                       type="date" 
                       value={selectedEndDate}
                       onChange={handleEndDateChange}
                       min={selectedStartDate || undefined}
                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5" 
                       placeholder="Select end date" />
              </div>
            </div>

          </div>
        </div>


            {/* <div className="filter-item">
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
            </div> */}

            {/* <div className="filter-item">
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
            </div> */}
          </div>



          {isLoading ? (
            <p className="loading-msg">Loading trips...</p>
          ) : errorMessage ? (
            <p className="error-msg">{errorMessage}</p>
          ) : filteredTrips.length > 0 ? (
            <div className="">
              {filteredTrips.map((trip) => (
                <div key={trip.tripId} className="block mb-3.5 w-full rounded-lg border border-lightgray-600 bg-white shadow-secondary-1">
                  <div className="flex border-b border-gray-300 px-6 py-3 text-surface h-[max-content]" style={{color: "black"}}>
                    <span className="mr-2.5">

                      <img className="w-10 h-10 rounded-full" 
                           src={trip.createdBy.profilePicture === null || trip.createdBy.profilePicture.trim().length === 0
                            ? "/images/null_avatar.png"
                            : trip.createdBy.profilePicture} />
                    

                    </span>
                    <span className="flex-auto py-1">@{trip.createdBy.username}</span>
                    <button onClick={() => handleRequestToggle(trip.tripId)} 
                            className={`float-right py-1 px-2 font-semibold rounded border transition ${
                              isRequested[trip.tripId]
                                ? "bg-transparent text-blue-700 border-blue-500 hover:bg-blue-50"
                                : "bg-blue-500 text-white border-transparent hover:bg-blue-600"
                            }`}>
                      {isRequested[trip.tripId] ? "Cancel Request" : "Request Join"}
                    </button>
                    
                  </div>
                  <div className="block p-6">
                    <div className="flex">
                      <h2 className="flex-auto mb-2 text-xl font-medium leading-tight text-secondary-600">{trip.location}</h2>
                      <p className="float-right text-base text-secondary-600">
                        {moment(trip.startDate).format('MMM D, YYYY')} - {moment(trip.endDate).format('MMM D, YYYY')}
                      </p>
                    </div>
                    <p className="w-full text-base text-secondary-600">{trip.description}</p>   
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
