const LandingPage = () => {
  return (
    <div className="mt-10 max-w-full">
      <div className="flex flex-wrap items-center">
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
        <div className="w-full h-[600px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[56%] bg-black bg-opacity-50">
          <div className="text-center text-white text-[40px] h-max p-20">
            <h1>Find a Travel Compagnion</h1>
            <p>
              Find travel compagnions by creating and sharing your trips!
              Enabling a new experience!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
