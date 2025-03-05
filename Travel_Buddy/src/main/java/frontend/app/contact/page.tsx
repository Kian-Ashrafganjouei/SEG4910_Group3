"use client";
import Footer from "../layout/footer/page";
import Navbar from "../layout/navbar/page";

const Contact = () => {
  return (
    <div className="">
      <Navbar />
      <div className="main-div-contact-page mt-16 grid grid-rows-3 justify-center">
        <div className="header h-28 flex justify-center items-center ">
          <span className="text-5xl">Send us Your Thoughts!</span>
        </div>

        <form className="contact-form grid grid-cols-2 gap-10 justify-center">
          <div className="col-left grid grid-rows-2 gap-5 auto-rows-auto items-start">
            <div className="form-group h-auto">
              <label htmlFor="email" className="form-label">
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input border-b-slate-500"
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="form-group h-auto">
              <label htmlFor="title" className="form-label">
                Title:
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                placeholder="Title of your comment"
                required
              />
            </div>
          </div>
          <div className="col-right">
            <div className="form-group h-auto">
              <label htmlFor="comment" className="form-label">
                Comment:
              </label>
              <textarea
                id="comment"
                name="comment"
                className="form-textarea border border-gray-300"
                rows={5}
                required></textarea>
            </div>
          </div>
        </form>

        <div className="button flex justify-center items-center h-auto">
          <button
            type="submit"
            className="submit-button w-28 h-12 text-l font-bold bg-white text-black rounded-lg hover:bg-black hover:text-white hover:border-2  border-2 border-black">
            Submit
          </button>
        </div>
      </div>
      <style jsx>{`
        .form-input {
          width: 100%;
          background-color: #;
          padding: 0.8rem;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 1rem;
          color: #000;
        }

        .heading {
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 600;
          font-size: 1.8rem;
        }

        input,
        textarea {
          width: 100%;
          padding: 0.8rem;
          border-radius: 8px;
        }

        .error-msg {
          color: #d32f2f;
          text-align: center;
          margin-top: 1rem;
        }
      `}</style>
      <Footer />
    </div>
  );
};

export default Contact;
