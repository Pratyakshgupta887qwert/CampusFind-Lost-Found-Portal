import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

export const isAllowedEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return Boolean(domain && config.allowedEmailDomains.includes(domain));
};

export const actorFromUser = (user) => ({
  user: user._id,
  name: user.name,
  email: user.email,
});
