import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, title, comment } = await req.json();

    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("Transporter created"); // Debug log

    // Email options
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER, // Send to the same email configured in ENV
      subject: `Contact Form: ${title}`,
      text: `
        From: ${email}
        Subject: ${title}
        
        Message:
        ${comment}
      `,
    };

    console.log("Attempting to send email..."); // Debug log
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info); // Debug log

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
