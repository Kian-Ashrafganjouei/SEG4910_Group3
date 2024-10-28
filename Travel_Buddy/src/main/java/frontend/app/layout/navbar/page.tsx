const Navbar = () => {
  return (
    <div className="navbar">
      <div className="grid grid-cols-3 items-center p-4 bg-white text-black">
        <div className="text-xl font-bold">
          <a href="/">Travel Companion</a>
        </div>
        <div className="flex space-x-4 justify-center">
          <a href="/home" className="hover:underline">
            Home
          </a>
          <a href="/trips" className="hover:underline">
            Trips
          </a>
          <a href="/about" className="hover:underline">
            About
          </a>
          <a href="/contact" className="hover:underline">
            Contact
          </a>
        </div>
        <div className="flex justify-end">
          <a
            href="/signup"
            className=" hover:bg-black text-black hover:text-white font-bold py-2 px-4 rounded border-2 border-black">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
