import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { DatabaseService, User } from '../database/database-service'
import { initializeDatabase } from '../database/init'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

class AuthServiceClass {
  private dbService: DatabaseService | null = null
  private initialized = false
  private initError: Error | null = null

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      const db = await initializeDatabase()
      this.dbService = new DatabaseService(db)
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize database:', error)
      this.initError = error as Error
    }
  }

  async register(name: string, email: string, password: string) {
    // Wait for initialization to complete or fail
    if (!this.initialized && !this.initError) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // If we're in development mode and have a database error, use mock authentication
    if (this.initError && process.env.NODE_ENV === 'development') {
      console.log('Using mock authentication due to database error')
      return this.mockRegister(name, email, password)
    }

    if (!this.dbService) {
      throw new Error('Database service not initialized')
    }

    // Check if user already exists
    const existingUser = await this.dbService.getUserByEmail(email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await this.dbService.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      created_at: new Date().toISOString(),
    })

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return { user, token }
  }

  async login(email: string, password: string) {
    // Wait for initialization to complete or fail
    if (!this.initialized && !this.initError) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // If we're in development mode and have a database error, use mock authentication
    if (this.initError && process.env.NODE_ENV === 'development') {
      console.log('Using mock authentication due to database error')
      // For login, we'll only allow the admin@example.com account with password123
      if (email === 'admin@example.com' && password === 'password123') {
        return this.mockLogin(email)
      }
      throw new Error('Invalid credentials')
    }

    if (!this.dbService) {
      throw new Error('Database service not initialized')
    }

    // Find user by email
    const user = await this.dbService.getUserByEmail(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error('Invalid credentials')
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return { user: this.sanitizeUser(user), token }
  }

  // Mock authentication for development when database fails
  private mockRegister(name: string, email: string, password: string) {
    const mockUser = {
      id: 'mock-' + Date.now(),
      name,
      email,
      role: 'user',
      created_at: new Date().toISOString(),
    }

    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email, role: mockUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return { user: mockUser, token }
  }

  private mockLogin(email: string) {
    const mockUser = {
      id: 'mock-admin',
      name: 'Admin User',
      email,
      role: 'admin',
      created_at: new Date().toISOString(),
    }

    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email, role: mockUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return { user: mockUser, token }
  }

  private sanitizeUser(user: User) {
    const { id, email, name, subscription_plan, created_at } = user
    return { id, email, name, subscription_plan, created_at }
  }
}

// Export a singleton instance
export const AuthService = new AuthServiceClass()