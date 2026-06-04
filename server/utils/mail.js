import nodemailer from 'nodemailer';
import { config } from '../config.js';

const hasSmtp = Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);

export const sendVerificationEmail = async ({ email, code }) => {
  if (!hasSmtp) {
    console.log(`Development verification code for ${email}: ${code}`);
    return { delivered: false, devCode: code };
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  await transporter.sendMail({
    from: config.smtp.from,
    to: email,
    subject: 'CampusFind email verification',
    text: `Your CampusFind verification code is ${code}. It expires in 15 minutes.`,
  });

  return { delivered: true };
};
