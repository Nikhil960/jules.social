import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { DatabaseService } from "../config/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export interface User {
  id: number
  email: string
  name?: string
  subscription_plan: string
  created_at: string
}

export interface AuthResult {
  user: User
  token: string
}

export class AuthService {
  static async register(email: string, password: string, name?: string): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = DatabaseService.getUserByEmail(email)
    if (existingUser) {
      throw new Error("User already exists with this email")
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const result = DatabaseService.createUser(email, passwordHash, name)
    const userId = result.lastInsertRowid as number

    // Get created user
    const user = DatabaseService.getUserById(userId)
    if (!user) {
      throw new Error("Failed to create user")
    }

    // Generate JWT token
    const token = this.generateToken(user)

    return {
      user: this.sanitizeUser(user),
      token,
    }
  }

  static async login(email: string, password: string): Promise<AuthResult> {
    // Get user by email
    const user = DatabaseService.getUserByEmail(email)
    if (!user) {
      throw new Error("Invalid email or password")
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      throw new Error("Invalid email or password")
    }

    // Generate JWT token
    const token = this.generateToken(user)

    return {
      user: this.sanitizeUser(user),
      token,
    }
  }

  static async getUserFromToken(token: string): Promise<User | null> {
    try {
      const decoded = this.verifyToken(token) as any
      const user = DatabaseService.getUserById(Number(decoded.userId))

      if (!user) {
        return null
      }

      return this.sanitizeUser(user)
    } catch (error) {
      return null
    }
  }

  static verifyToken(token: string): string | jwt.JwtPayload {
    return jwt.verify(token, JWT_SECRET)
  }

  static generateToken(user: any): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    )
  }

  static sanitizeUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      subscription_plan: user.subscription_plan,
      created_at: user.created_at,
    }
  }

  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = DatabaseService.getUserById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isValidPassword) {
      throw new Error("Current password is incorrect")
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    const db = DatabaseService.getDb()
    db.prepare("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
      newPasswordHash,
      userId,
    )
  }

  static async resetPassword(email: string): Promise<string> {
    const user = DatabaseService.getUserByEmail(email)
    if (!user) {
      throw new Error("User not found")
    }

    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" })
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    const db = DatabaseService.getDb()
    db.prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?").run(
      resetToken,
      expiresAt,
      user.id,
    )

    return resetToken
  }

  static async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      const user = DatabaseService.getUserById(Number(decoded.userId))

      if (!user || user.reset_token !== token) {
        throw new Error("Invalid or expired reset token")
      }

      if (new Date() > new Date(user.reset_token_expires)) {
        throw new Error("Reset token has expired")
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10)
      const db = DatabaseService.getDb()
      db.prepare(`
        UPDATE users 
        SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(newPasswordHash, user.id)
    } catch (error) {
      throw new Error("Invalid or expired reset token")
    }
  }
}

export { AuthService };
