import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendMail = async (email, subject, message) => {
  try {
    const transpoter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASS_MAIL,
      },
    });

    const mailOption = {
      from: process.env.USER_MAIL,
      to: email,
      subject: subject,
      html: `
        <html>
            <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <h1 style="color: #333;">${subject}</h1>
                    <p style="font-size: 24px; font-weight: bold; color: #007bff;">${message}</p>
                </div>
            </body>
        </html>`,
    };

    transpoter.sendMail(mailOption, (err, info) => {
      if (err) {
        console.log("error while sending email", err);
      } else {
        console.log("email sended , info :", info);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
