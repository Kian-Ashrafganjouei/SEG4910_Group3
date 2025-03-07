// Footer Component
const Footer = () => {
  return (
    <div className="footer ">
      {/* Footer Links Section */}
      <div className="footer-links p-4 bg-white text-black border-stone-300 border-t-2">
        {/* Links Row */}
        <div className="links-row flex justify-center space-x-8 mb-4">
          {/* Privacy Policy Link */}
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>

          {/* Terms of Service Link */}
          <a href="#" className="hover:underline">
            Terms of Service
          </a>

          {/* Contact Us Link */}
          <a href="/contact" className="hover:underline">
            Contact Us
          </a>

          {/* About Us Link */}
          <a href="/about" className="hover:underline">
            About Us
          </a>
        </div>

        {/* Horizontal Line Separator */}
        <hr className="border-t border-gray-600 mb-4" />

        {/* Social Media Links (Commented Out) */}
        {/* <div className="social-media-row flex justify-center space-x-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer">
            <img src="/icons/facebook.svg" alt="Facebook" className="w-6 h-6" />
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer">
            <img src="/icons/twitter.svg" alt="Twitter" className="w-6 h-6" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer">
            <faInstagram/>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer">
            <img src="/icons/linkedin.svg" alt="LinkedIn" className="w-6 h-6" />
          </a>
        </div> */}
      </div>
    </div>
  );
};

export default Footer;
