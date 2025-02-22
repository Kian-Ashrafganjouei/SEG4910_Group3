"use client";
import Navbar from "../layout/navbar/page";
import Footer from "../layout/footer/page";

const About = () => {
  const memberInfo = [
    {
      name: "Hossein Hajmirbaba",
      imageUrl: "/images/connect_pic.jpg",
      description:
        "Co-founder, Chairman, CEO, CTO, CFO, ProductOwner & ScrumMaster",
    },
    {
      name: "Kian Ashrafganjouei",
      imageUrl: "/images/connect_pic.jpg",
      description: "Co-founder, QA Developer",
    },
    {
      name: "Jazia Djoudad",
      imageUrl: "/images/communities_pic.jpg",
      description: "Co-founder, ProductOwner & Lead Developer",
    },
    {
      name: "Ghait Ouled Amar Ben Cheikh",
      imageUrl: "/images/create_trips.jpg",
      description: "Co-founder, Build Manager & Developer",
    },
    {
      name: "Isam Karroum",
      imageUrl: "/images/communities_pic.jpg",
      description: "Co-founder, UI/UX Developer",
    },
    {
      name: "Lisa Korolyov",
      imageUrl: "/images/communities_pic.jpg",
      description: "Co-founder, UI/UX Developer",
    },
  ];
  return (
    <div>
      <Navbar />
      <div className="main-div mt-16">
        <div className="hero-section h-96 grid gap-10 justify-items-center text-white p-10 ">
          <div className="content w-3/4">
            <p className="text-5xl/relaxed text-center ">
              Bringing travelers together to create unforgettable adventures
              with the perfect companions
            </p>
          </div>
        </div>
        <div className="why-section bg-slate-100 grid grid-cols-10 justify-items-center pt-20 p-10 pb-20">
          <div className="title col-span-4 text-4xl">
            <h1>Who Are We?</h1>
          </div>
          <div className="content col-span-5 ">
            <span className="text-2xl/relaxed pt-5">
              We are a team of developers dedicated to solve problems. Our
              objective building this platform was to enable travellers
              experience a new way of travelling. We hope that through Travel
              Companion, travellers can make new connections!
            </span>
          </div>
        </div>
        <div className="our-team grid grid-cols-5 mt-8 p-10">
          <div className="title-div text-4xl col-span-2 justify-items-center">
            <h1 className="">Our Team</h1>
          </div>
          <div className="team col-span-3 grid grid-cols-2 gap-y-10 justify-items-start">
            {memberInfo.map((member, index) => (
              <div className="card h-auto w-72 gap-5 flex flex-col" key={index}>
                {/* Added flex and flex-col */}
                <div className="picture w-full h-52 rounded-2xl overflow-hidden">
                  {/* Added overflow-hidden */}
                  <img
                    src={member.imageUrl}
                    alt="pfp"
                    className="object-cover w-full h-full"
                  />
                  {/* Added object-cover, w-full, h-full */}
                </div>
                <div className="name text-3xl">
                  <span>{member.name}</span>
                </div>
                <div className="description text-xl text-gray-500">
                  <span>{member.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .hero-section {
            position: relative; /* Set position to relative for the pseudo-element */
            display: flex;
            height: 600px;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden; /* Hide overflow to prevent the pseudo-element from showing outside */
          }

          .hero-section::before {
            content: ""; /* Required for pseudo-element */
            position: absolute; /* Position it absolutely */
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url("/images/create_trips.jpg"); /* Replace with your image path */
            background-size: cover;
            background-position: center;
            filter: blur(5px); /* Add Gaussian blur */
            z-index: 0; /* Send it to the back */
          }

          .hero-section > * {
            position: relative; /* Position child elements above the pseudo-element */
            z-index: 1; /* Bring text and other content above the blurred background */
          }
        `}
      </style>
      <Footer />
    </div>
  );
};

export default About;
