import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

export function verifyEdgeToken(token: string): string | jwt.JwtPayload {
  return jwt.verify(token, JWT_SECRET);
}