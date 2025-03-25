"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import moment from "moment";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faSort,
  faFilter,
  faPlus,
  faMinus,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

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

interface UserTrip {
  userTripId: number;
  status: string; // "requested", "joined", or "declined"
  trip: {
    tripId: number;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  };
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
  images: string[]; // Add images array
}

interface Interest {
  interestId: number;
  name: string;
}

const START_DATE_ASC_KEYWORD = "startDateAsc";
const START_DATE_DESC_KEYWORD = "startDateDesc";
const DURATION_ASC_KEYWORD = "durationAsc";
const DURATION_DESC_KEYWORD = "durationDesc";

export default function ExploreTripsComponent() {
  // Useful information about the user currently logged in.
  const { data: session } = useSession();
  // Trips fetched from the backend that are displayed to the user.
  const [trips, setTrips] = useState<Trip[]>([]);
  const [userTrips, setUserTrips] = useState<UserTrip[]>([]);
  // Improves the UX of the website by communicating to the user that we are waiting for a
  // response/data.
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRequested, setIsRequested] = useState<Record<number, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);

  // Some of the variables below are used for filtering trips based on user defined
  // criteria such as the location, the start date, the interests etc...
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedStartDate, setSelectedStartDate] = useState<string>("");
  const [selectedEndDate, setSelectedEndDate] = useState<string>("");
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDatesDropdown, setShowDatesDropdown] = useState(false);
  const [selectedSortType, setSelectedSortType] = useState<string>(
    START_DATE_ASC_KEYWORD
  );
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // Fetch trips from the backend and display them to the user. We also retrieve and store
  // every unique trip location for filtering purposes later.
  //
  // This callback is called once as long as the `session` of the user doesn't change. The
  // `session` variable can change if the user decides to log back in with a different
  // account which is currently allowed.
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("/backend/trips");
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

    // Fetch the list of interests available from the backend rather than hard coding them
    // in the frontend.
    const fetchInterests = async () => {
      try {
        const response = await fetch("/backend/interests");
        if (!response.ok) throw new Error("Failed to fetch interests.");

        const data = await response.json();
        setInterests(data);
      } catch (error) {
        console.error("Error fetching interests:", error);
        setErrorMessage("An error occurred while fetching interests.");
      }
    };

    // Fetch trips associated with the user currently logged in.
    const fetchUserTrips = async () => {
      if (!session?.user?.email) return;
      try {
        const response = await fetch(
          `/backend/user-trips?email=${session.user.email}`
        );
        if (!response.ok) throw new Error("Failed to fetch user trips");

        const data = await response.json();
        console.log("Fetched userTrips:", data); // Debugging
        setUserTrips(data);
      } catch (error) {
        console.error("Error fetching user trips:", error);
      }
    };

    fetchTrips();
    fetchUserTrips();
    fetchInterests();
  }, [session]);

  // Fires when the user clicks on the join trip button.
  //
  // Not called directly. See `handleRequestToggle` to see how this closure is called.
  const handleJoinTrip = async (tripId: number) => {
    try {
      const payload = {
        tripId,
        userEmail: session?.user?.email,
        status: "requested",
      };

      console.log("Payload being sent:", payload);

      const response = await fetch("/backend/user-trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        throw new Error(errorResponse);
      }

      alert("Trip join request sent successfully.");
    } catch (error) {
      console.error("Error joining trip:", error);
      alert(`An error occurred while joining the trip: ${error.message}`);
    }
  };

  // Handles review submission. Users can leave reviews that can be viewed by other users.
  const handleReviewSubmit = async (tripId, rating) => {
    if (!rating) return;
    console.log(tripId, rating);

    try {
      const response = await fetch("/backend/reviewstemp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, rating }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  // Returns whether the trip identified by `tripId` is `joined`, `requested` or
  // `declined`.
  const getUserTripStatus = (tripId: number): string | null => {
    const userTrip = userTrips.find((ut) => ut.trip?.tripId === tripId);
    console.log(
      "Checking status for tripId:",
      tripId,
      "Status:",
      userTrip?.status
    ); // Debugging
    return userTrip ? userTrip.status : null;
  };

  // Updates the trips seen by the user based on filtering criteria such as interests,
  // locations, start and end dates etc...
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
            ? new Date(trip.endDate) >= new Date(selectedStartDate) &&
              new Date(trip.startDate) <= new Date(selectedEndDate)
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
    if (showLocationDropdown) setShowLocationDropdown(false);
    if (showDatesDropdown) setShowDatesDropdown(false);
    setShowInterestDropdown(!showInterestDropdown);
  };

  const toggleShowLocationDropdown = () => {
    if (showInterestDropdown) setShowInterestDropdown(false);
    if (showDatesDropdown) setShowDatesDropdown(false);
    setShowLocationDropdown(!showLocationDropdown);
  };

  const toggleShowDatesDropdown = () => {
    if (showInterestDropdown) setShowInterestDropdown(false);
    if (showLocationDropdown) setShowLocationDropdown(false);
    setShowDatesDropdown(!showDatesDropdown);
  };

  const toggleShowFilters = () => {
    if (showSort) setShowSort(false);
    setShowFilters(!showFilters);
  };

  const toggleShowSort = () => {
    if (showFilters) setShowFilters(false);
    setShowSort(!showSort);
  };

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

  // The request to join a trip button handles both user registration and unregistration.
  const handleRequestToggle = async (tripId: number) => {
    setIsRequested((oldVal) => ({
      ...oldVal,
      [tripId]: !oldVal[tripId],
    }));
    await handleJoinTrip(tripId);
    window.location.reload();
  };

  const sortTrips = (sortType: string) => {
    toggleShowSort();
    setSelectedSortType(sortType);

    let sortedTrips = [];
    switch (sortType) {
      case START_DATE_DESC_KEYWORD:
        sortedTrips = [...filteredTrips].sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        break;

      case DURATION_ASC_KEYWORD:
        sortedTrips = [...filteredTrips].sort(
          (a, b) =>
            new Date(a.endDate).getTime() -
            new Date(a.startDate).getTime() -
            (new Date(b.endDate).getTime() - new Date(b.startDate).getTime())
        );
        break;

      case DURATION_DESC_KEYWORD:
        sortedTrips = [...filteredTrips].sort(
          (a, b) =>
            new Date(b.endDate).getTime() -
            new Date(b.startDate).getTime() -
            (new Date(a.endDate).getTime() - new Date(a.startDate).getTime())
        );
        break;

      default: // default to start date ascending
        sortedTrips = [...filteredTrips].sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        break;
    }
    setFilteredTrips(sortedTrips);
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = event.target.value;
    setSearchKeyword(keyword);
    search(keyword); // Call search function immediately
  };
  

  const search = (keyword: string) => {
    if (!keyword.trim()) {
      setFilteredTrips([...trips]); // ✅ Use trips instead of allTrips
      return;
    }
  
    const lowerCaseKeyword = keyword.trim().toLowerCase();
  
    const results = trips.filter((trip) =>
      trip.location.toLowerCase().includes(lowerCaseKeyword)
    );
  
    setFilteredTrips(results);
  };
  

  {
    /* <script src="/js/flowbite.min.js"></script> */
  }
  {
    /* <script src="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.js"></script> */
  }
  return (
    <div className="home-page grid grid-cols-4 p-10 gap-10">
      <div
        id="searchSortFilterComponent"
        className="filtering-area mb-3 col-span-1">
        <div className="search-and-sort grid grid-cols-4 mb-5">
          <div
            id="searchComponent"
            className=" relative flex border border-lightgray-600 rounded col-span-3"
            data-twe-input-wrapper-init
            data-twe-input-group-ref>
            <input
              type="search"
              className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none"
              placeholder={searchKeyword ? "" : "Search"}
              id="search-input"
              value={searchKeyword}
              onChange={handleSearchInputChange}
            />
            <button
              className="border border-lightgray-600 rounded relative z-[2] -ms-0.5 flex items-center bg-primary px-5 text-xs shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2"
              type="button"
              id="search-button"
              data-twe-ripple-init
              data-twe-ripple-color="light">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="text-gray-500"
              />
            </button>
          </div>
          <div id="sortComponent" className="flex relative jsutify-center col-span-1">
            <div>
              <button
                type="button"
                className="h-full ml-2.5 px-2 py-1 group flex items-center inline-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900"
                id="sortButton"
                onClick={toggleShowSort}>
                <FontAwesomeIcon
                  icon={faSort}
                  className="text-gray-500 px-1.5 items-center"
                />
                Sort
              </button>
            </div>
            <div
              className={`absolute left-0 top-[30px] z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none ${
                showSort ? "" : "hidden"
              }`}
              role="menu">
              <div className="py-1">
                <a
                  href="#"
                  onClick={() => sortTrips(START_DATE_ASC_KEYWORD)}
                  className={`block px-4 py-2 text-sm ${
                    selectedSortType === START_DATE_ASC_KEYWORD
                      ? "font-medium text-gray-900"
                      : "text-gray-500"
                  }`}
                  role="menuitem">
                  Start Date Asc
                </a>
                <a
                  href="#"
                  onClick={() => sortTrips(START_DATE_DESC_KEYWORD)}
                  className={`block px-4 py-2 text-sm ${
                    selectedSortType === START_DATE_DESC_KEYWORD
                      ? "font-medium text-gray-900"
                      : "text-gray-500"
                  }`}
                  role="menuitem">
                  Start Date Desc
                </a>
                <a
                  href="#"
                  onClick={() => sortTrips(DURATION_ASC_KEYWORD)}
                  className={`block px-4 py-2 text-sm ${
                    selectedSortType === DURATION_ASC_KEYWORD
                      ? "font-medium text-gray-900"
                      : "text-gray-500"
                  }`}
                  role="menuitem">
                  Duration Asc
                </a>
                <a
                  href="#"
                  onClick={() => sortTrips(DURATION_DESC_KEYWORD)}
                  className={`block px-4 py-2 text-sm ${
                    selectedSortType === DURATION_DESC_KEYWORD
                      ? "font-medium text-gray-900"
                      : "text-gray-500"
                  }`}
                  role="menuitem">
                  Duration Desc
                </a>
              </div>
            </div>
          </div>
        </div>

        <div id="filtersContainer" className="">
          {/* Interests filtering code */}
          <div
            id="interestsFilterComponent"
            className="border-t border-gray-200 px-4 py-6">
            <h3 className="-mx-2 -my-3 flow-root">
              <button
                type="button"
                className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500"
                onClick={() => toggleShowInterestDropdown()}>
                <span className="font-medium text-gray-900">Interests</span>
                <span className="ml-6 flex items-center">
                  {showInterestDropdown ? (
                    <FontAwesomeIcon icon={faMinus} />
                  ) : (
                    <FontAwesomeIcon icon={faPlus} />
                  )}
                </span>
              </button>
            </h3>
            <div
              className={`pt-6 ${
                showInterestDropdown ? "" : "hidden"
              }`}
              id="interestsFilters">
              <div className="space-y-3"> 
                {interests.map((interest) => (
                  <div className="flex items-center space-x-3">
                    <input
                      name={`interest${interest.interestId}`}
                      id={`interest${interest.interestId}`}
                      value={interest.interestId}
                      type="checkbox"
                      className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      checked={selectedInterests.includes(interest.interestId)}
                      onChange={() => handleInterestChange(interest.interestId)}
                    />
                    <label
                      htmlFor={`interest${interest.interestId}`}
                      className="text-gray-500"
                      key={interest.interestId}>
                      {interest.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dates filtering code */}
        <div
          id="datesFilterComponent"
          className="border-t border-gray-200 px-4 py-6">
          <h3 className="-mx-2 -my-3 flow-root">
            <button
              type="button"
              className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500"
              onClick={() => toggleShowDatesDropdown()}>
              <span className="font-medium text-gray-900">Dates</span>
              <span className="ml-6 flex items-center">
                {showDatesDropdown ? (
                  <FontAwesomeIcon icon={faMinus} />
                ) : (
                  <FontAwesomeIcon icon={faPlus} />
                )}
              </span>
            </button>
          </h3>
          <div
            className={`pt-6 max-h-64 overflow-y-auto ${
              showDatesDropdown ? "" : "hidden"
            }`}
            id="interestsFilters">
            <div id="date-range-picker" className="grid grid-rows-2 gap-5">
              <div>
                <span className=" text-gray-500">From:</span>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <FontAwesomeIcon icon={faCalendar} />
                  </div>
                  <input
                    id="start-date-filter"
                    name="start"
                    type="date"
                    value={selectedStartDate}
                    onChange={handleStartDateChange}
                    max={selectedEndDate || undefined}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
                    placeholder="Select start date"
                  />
                </div>
              </div>
              <div>
                <span className=" text-gray-500">To:</span>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <FontAwesomeIcon icon={faCalendar} />
                  </div>
                  <input
                    id="end-date-filter"
                    name="end"
                    type="date"
                    value={selectedEndDate}
                    onChange={handleEndDateChange}
                    min={selectedStartDate || undefined}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
                    placeholder="Select end date"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <p className="loading-msg">Loading trips...</p>
      ) : errorMessage ? (
        <p className="error-msg">{errorMessage}</p>
      ) : filteredTrips.length > 0 ? (
        <div className="cards col-span-3 grid grid-cols-2 gap-10">
          {filteredTrips.map((trip) => (
            <div
              key={trip.tripId}
              className="block w-full rounded-lg border border-lightgray-600 bg-white shadow-secondary-1">
              <div
                className="flex border-b border-gray-300 px-6 py-3 text-surface h-[max-content]"
                style={{ color: "black" }}>
                <span className="mr-2.5">
                  <img
                    className="w-10 h-10 rounded-full"
                    src={
                      trip.createdBy.profilePicture === null ||
                      trip.createdBy.profilePicture.trim().length === 0
                        ? "/images/null_avatar.png"
                        : trip.createdBy.profilePicture
                    }
                  />
                </span>
                <span className="flex-auto py-1">
                  @{trip.createdBy.username}
                </span>
                {getUserTripStatus(trip.tripId) === "joined" && (
                  <div className="mt-2 flex items-center">
                    <select
                      className="bg-transparent text-blue-700 border-blue-500 hover:bg-blue-50"
                      onChange={(e) => handleReviewSubmit(trip.tripId, e.target.value)}
                    >
                      <option value="">Rate Trip</option>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>{num} ⭐</option>
                      ))}
                    </select>
                  </div>
                )}
                {(getUserTripStatus(trip.tripId) === "joined" ||
                  getUserTripStatus(trip.tripId) === "declined" ||
                  getUserTripStatus(trip.tripId) === "requested" ||
                  trip.createdBy.email === session?.user?.email) && (
                  <span className="float-right flex items-center justify-center py-1 px-2 text-sm font-medium rounded border bg-gray-300 text-gray-700 border-gray-400">
                    {trip.createdBy.email === session?.user?.email
                      ? "Created"
                      : getUserTripStatus(trip.tripId) === "joined"
                      ? "Joined"
                      : getUserTripStatus(trip.tripId) === "declined"
                      ? "Declined"
                      : getUserTripStatus(trip.tripId) === "requested"
                      ? "Requested"
                      : ""}
                  </span>
                )}
                
                <button
                  onClick={() => handleRequestToggle(trip.tripId)}
                  className={`float-right py-1 px-2 font-semibold rounded border transition ${
                    getUserTripStatus(trip.tripId) === "requested"
                      ? "bg-transparent text-blue-700 border-blue-500 hover:bg-blue-50"
                      : "bg-blue-500 text-white border-transparent hover:bg-blue-600"
                  } ${
                    getUserTripStatus(trip.tripId) ||
                    trip.createdBy.email === session?.user?.email
                      ? "hidden"
                      : ""
                  }`}>
                  {getUserTripStatus(trip.tripId) === "requested"
                    ? "Requested"
                    : getUserTripStatus(trip.tripId) || "Request Join"}
                </button>
              </div>
              <div className="block p-6">
                <div className="flex">
                  <h2 className="flex-auto mb-2 text-xl font-medium leading-tight text-secondary-600">
                    {trip.location}
                  </h2>
                  <p className="float-right text-base text-secondary-600">
                    {moment(trip.startDate).format("MMM D, YYYY")} -{" "}
                    {moment(trip.endDate).format("MMM D, YYYY")}
                  </p>
                </div>
                {/* Trip Images Carousel */}
                {trip.images && trip.images.length > 0 && (
                  <div className="carousel-container mt-4 mb-4">
                    {trip.images.length > 1 ? (
                      <Slider dots={true} infinite={true} speed={500} slidesToShow={1} slidesToScroll={1}>
                        {trip.images.map((image, index) => (
                          <div key={index} className="pl-2"> {/* Move images slightly left */}
                            <img
                              src={image}
                              alt={`Trip ${trip.tripId} Image ${index + 1}`}
                              className="rounded-lg w-full h-48 object-cover"
                            />
                          </div>
                        ))}
                      </Slider>
                    ) : (
                      <div className="pl-2">
                        <img
                          src={trip.images[0]}
                          alt={`Trip ${trip.tripId} Image`}
                          className="rounded-lg w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
                <p className="w-full text-base text-secondary-600">
                  {trip.description}
                </p>
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
        <p className="no-trips-msg">No results.</p>
      )}
    </div>
  );
}
