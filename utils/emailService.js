import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 1,
    });

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const sendEmailWithRetry = async (mailOptions, retries = 0) => {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email Sent Successfully", info.response);
        return info;
      } catch (error) {
        if (retries < MAX_RETRIES) {
          console.log(
            `Retry Attempts ${retries + 1} for email to ${mailOptions.to}`
          );
          await sleep(RETRY_DELAY * (retries + 1));
          return sendEmailWithRetry(mailOptions, retries + 1);
        }
        throw new Error(
          `Failed to send email after ${MAX_RETRIES} attempts : ${error.message}`
        );
      }
    };
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    return await sendEmailWithRetry(mailOptions);
  } catch (error) {
    console.log("Error sending email", error.message);
    throw error;
  }
};

export default sendEmail;
