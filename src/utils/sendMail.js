// import nodemailer from 'nodemailer';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (options) => {
  return resend.emails.send({
    from: process.env.RESEND_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

// export const sendEmail = async (options) => {
//   return await transporter.sendMail(options);
// };
