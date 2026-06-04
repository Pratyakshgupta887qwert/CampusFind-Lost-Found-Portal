import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://127.0.0.1:5173',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusfind',
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-before-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  allowedEmailDomains: (process.env.ALLOWED_EMAIL_DOMAINS || 'gla.ac.in,glau.ac.in,student.gla.ac.in')
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean),
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'CampusFind <no-reply@campusfind.local>',
  },
};
