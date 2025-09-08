// File: lib/externalvalidation.js
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.API_SECRET_KEY || 'fallback-secret-key';

export function generateToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded; // important: return decoded info (not just true/false)
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return null;
  }
}
