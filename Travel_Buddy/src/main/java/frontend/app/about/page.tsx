"use client";
import Navbar from "../layout/navbar/page";
import Footer from "../layout/footer/page";

const About = () => {
  const memberInfo = [
    {
      name: "Hossein Hajmirbaba",
      profilepic: "/images/connect_pic.jpg",
      description: "Co-founder, Chairman, CEO, CTO, CFO & ScrumMaster",
    },
    {
      name: "Kian Ashrafganjouei",
      imageUrl: "/images/connect_pic.jpg",
      description: "Co-founder, Developer & ProductOwner",
    },
    {
      name: "Jazia Djoudad",
      imageUrl: "/images/communities_pic.jpg",
      description: "Co-founder, Lead Developer",
    },
    {
      name: "Ghait Ouled Amar Ben Cheikh",
      imageUrl: "/images/create_trips.jpg",
      description: "Co-founder, Developer",
    },
    {
      name: "Isam Karroum",
      imageUrl: "/images/communities_pic.jpg",
      description: "Co-founder, Developer",
    },
    {
      name: "Lisa Korolyov",
      imageUrl: "/images/communities_pic.jpg",
      description: "Co-founder, Developer",
    },
  ];
  return (
    <div>
      <Navbar />

      <div className="about mt-16">
        <div className="about-us grid gap-10 justify-items-center">
          <div className="title mt-16 text-4xl">
            <h1>Who Are We?</h1>
          </div>
          <div className="content w-1/2">
            <span className="text-3xl leading-relaxed">
              We are a team of developers dedicated to solve problems. Our
              objective building this platform was to enable travellers
              experience a new way of travelling. We hope that through Travel
              Companion, travellers can make new connections!
            </span>
          </div>
        </div>
        <div className="team grid grid-cols-3 gap-3 justify-items-center p-10">
          {memberInfo.map((member, index) => (
            <div
              className="card border border-black rounded-md h-40 w-52 justify-items-center gap-3 p-3"
              key={index}>
              <div className="picture w-10 h-9">
                <img src={member.imageUrl} alt="pfp" />
              </div>
              <div className="name">
                <span>{member.name}</span>
              </div>
              <div className="description">
                <span>{member.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
