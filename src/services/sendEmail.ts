// src/utils/sendEmail.ts
import nodemailer from "nodemailer";
import Token from "../models/token.model";
import User from "../models/user.model";

export const sendVerificationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    // host: "sandbox.smtp.mailtrap.io",
    // port: 2525,
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.APP_EMAIL_PASS,
    },
  });

  const verificationLink = `https://skillstream-63xr.onrender.com/api/verify?token=${token}`;
  //   console.log({ transporter });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your email address",
    text: `Please verify your email address by clicking on the link: ${verificationLink}`,
    html: `<p>Please verify your email address by clicking on the link: <a href="${verificationLink}">Click here</a></p>`,
  };

  return transporter.sendMail(mailOptions);
};
