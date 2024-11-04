"use client";
import { useState } from "react";
import Navbar from "./layout/navbar/page";
import Footer from "./layout/footer/page";

const LandingPage = () => {
  const features = [
    {
      title: "Feature 1",
      imageUrl: "/images/france_landpage.jpg",
      description: "Description for Benefit of Feature 1.",
    },
    {
      title: "Feature 2",
      imageUrl: "/images/japan_landpage.jpg",
      description: "Description for Benefit of Feature 2.",
    },
    {
      title: "Feature 3",
      imageUrl: "/images/usa_landpage.jpg",
      description: "Description for Benefit of Feature 3.",
    },
    {
      title: "Feature 4",
      imageUrl: "/images/japan_landpage.jpg",
      description: "Description for Benefit of Feature 4.",
    },
  ];

  const [selectedFeature, setSelectedFeature] = useState<number>(0);

  return (
    // Landing Page
    <div className="max-w-full mt-16">
      <Navbar />
      {/* hero section */}
      <div className=" hero-section flex flex-wrap items-center">
        {/* Images Section */}
        <div className="flex justify-center text-center h-[600px] overflow-hidden w-full">
          <img
            src="/images/france_landpage.jpg"
            alt="picture1"
            className="w-full h-[700px] bg-white border-l border-solid border-1"
          />
          <img
            src="/images/japan_landpage.jpg"
            alt="picture2"
            className="w-full h-[700px] bg-white border-l border-solid border-1"
          />
          <img
            src="/images/usa_landpage.jpg"
            alt="picture3"
            className="w-full h-[700px] bg-white border-l border-solid border-1"
          />
        </div>
        {/* Overlay Text Content */}
        <div className="w-full h-[600px] absolute bg-black bg-opacity-25">
          <div className="text-center text-white text-[40px] h-max p-20">
            <h1>Find a Travel Companion</h1>
            <p>
              Find travel companion by creating and sharing your trips! Enabling
              a new experience!
            </p>
            <a
              className="signup rounded-md bg-black text-white text-xl py-4 px-6"
              href="/signup">
              Sign Up
            </a>
          </div>
        </div>
      </div>
      <div className="features-section grid grid-cols-2 justify-items-center p-10 bg-white">
        <div className="feature-list text-black text-2xl p-4 flex flex-col justify-center gap-4">
          {features.map((feature, index) => (
            <div className="mb-4" key={index}>
              <button
                className="w-full text-left font-bold"
                onClick={() => setSelectedFeature(index)}>
                {feature.title}
              </button>
              {selectedFeature === index && (
                <p className="mt-2">{feature.description}</p>
              )}
            </div>
          ))}
        </div>
        <div className="feature-image p-4">
          {selectedFeature !== null && (
            <img
              src={features[selectedFeature].imageUrl}
              alt={`Feature ${selectedFeature + 1}`}
              className="w-full h-96 rounded-xl"
            />
          )}
        </div>
      </div>
      {/* Sign up section */}
      <div className="signup-section bg-[#f2f2f2] text-black">
        <div className="justify-items-center p-10 grid grid-rows-2 gap-10">
          <h1 className="text-6xl	p-10">Ready to Start a new Journey?</h1>
          <a
            className="signup rounded-md bg-black text-white p-10 flex items-center justify-center"
            style={{ width: "160px", height: "40px" }}
            href="/signup">
            Sign Up
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
