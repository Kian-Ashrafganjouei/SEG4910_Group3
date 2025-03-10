"use client";
import Footer from "../layout/footer/page";
import Navbar from "../layout/navbar/page";
import { useState } from "react";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true); // Set submission state to true

    // Extract form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      email: formData.get("email"), // Get email from form data
      title: formData.get("title"), // Get title from form data
      comment: formData.get("comment"), // Get comment from form data
    };

    console.log("Sending email with data: ", data); // Log data being sent

    try {
      // Send POST request to the contact API
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set content type to JSON
        },
        body: JSON.stringify(data), // Convert data to JSON string
      });

      const result = await response.json(); // Parse the response data
      console.log("Server response:", result); // Log server response

      if (response.ok) {
        alert("Message sent successfully!"); // Notify user of success
        form.reset(); // Reset the form fields
      } else {
        alert(`Failed to send message: ${result.error}`); // Notify user of failure
      }
    } catch (error) {
      console.error("Error:", error); // Log any errors
      alert("An error occurred. Please try again later."); // Notify user of error
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };

  return (
    <div className="">
      <Navbar />
      <div className="main-div-contact-page mt-16 justify-center">
        <div className="header h-28 flex justify-center items-center mb-16">
          <span className="text-5xl">Send us Your Thoughts!</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="contact-form grid grid-rows-2 gap-10 justify-center">
          <div className="cols grid grid-cols-2 gap-10">
            <div className="col-left grid grid-rows-2 gap-5 auto-rows-auto items-start">
              {/* Input field for email address */}
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
              {/* Input field for title address */}
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
              {/* Input field for comments */}
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
          </div>

          <div className="button flex justify-center items-center h-auto">
            <button
              type="submit"
              className="submit-button w-28 h-12 text-l font-bold bg-white text-black rounded-lg hover:bg-black hover:text-white hover:border-2  border-2 border-black">
              Submit
            </button>
          </div>
        </form>
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
