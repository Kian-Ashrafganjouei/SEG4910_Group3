"use client";

import { useState } from "react";

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
    <div className="mt-10 max-w-full">
      {/* hero section */}
      <div className=" hero-section flex flex-wrap items-center">
        {/* Images Section */}
        <div className="flex justify-center text-center h-[600px] overflow-hidden w-full">
          <img
            src=""
            alt="picture1"
            className="w-full h-[700px] bg-white border-l border-solid border-1"
          />
          <img
            src=""
            alt="picture2"
            className="w-full h-[700px] bg-white border-l border-solid border-1"
          />
          <img
            src=""
            alt="picture3"
            className="w-full h-[700px] bg-white border-l border-solid border-1"
          />
        </div>
        {/* Overlay Text Content */}
        <div className="w-full h-[600px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[58%] bg-black bg-opacity-50">
          <div className="text-center text-white text-[40px] h-max p-20">
            <h1>Find a Travel Compagnion</h1>
            <p>
              Find travel compagnions by creating and sharing your trips!
              Enabling a new experience!
            </p>
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
    </div>
  );
};

export default LandingPage;
