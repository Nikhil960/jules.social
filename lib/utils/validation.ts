export interface ValidationError {
  field: string
  message: string
}

export class Validator {
  static validateEmail(email: string): ValidationError | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return { field: "email", message: "Email is required" }
    }
    if (!emailRegex.test(email)) {
      return { field: "email", message: "Invalid email format" }
    }
    return null
  }

  static validatePassword(password: string): ValidationError | null {
    if (!password) {
      return { field: "password", message: "Password is required" }
    }
    if (password.length < 6) {
      return { field: "password", message: "Password must be at least 6 characters long" }
    }
    if (password.length > 128) {
      return { field: "password", message: "Password must be less than 128 characters" }
    }
    return null
  }

  static validateName(name: string): ValidationError | null {
    if (name && name.length > 255) {
      return { field: "name", message: "Name must be less than 255 characters" }
    }
    return null
  }

  static validatePostContent(content: string, platform?: string): ValidationError | null {
    if (!content || content.trim().length === 0) {
      return { field: "content", message: "Content is required" }
    }

    const maxLength = platform === "x" ? 280 : 2200
    if (content.length > maxLength) {
      return {
        field: "content",
        message: `Content must be less than ${maxLength} characters for ${platform || "this platform"}`,
      }
    }

    return null
  }

  static validatePlatforms(platforms: string[]): ValidationError | null {
    if (!platforms || platforms.length === 0) {
      return { field: "platforms", message: "At least one platform must be selected" }
    }

    const validPlatforms = ["instagram", "x", "linkedin", "youtube", "facebook", "tiktok"]
    const invalidPlatforms = platforms.filter((p) => !validPlatforms.includes(p))

    if (invalidPlatforms.length > 0) {
      return { field: "platforms", message: `Invalid platforms: ${invalidPlatforms.join(", ")}` }
    }

    return null
  }

  static validateScheduledDate(scheduledAt: string): ValidationError | null {
    if (!scheduledAt) return null

    const scheduledDate = new Date(scheduledAt)
    const now = new Date()

    if (isNaN(scheduledDate.getTime())) {
      return { field: "scheduled_at", message: "Invalid date format" }
    }

    if (scheduledDate <= now) {
      return { field: "scheduled_at", message: "Scheduled date must be in the future" }
    }

    // Don't allow scheduling more than 1 year in advance
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    if (scheduledDate > oneYearFromNow) {
      return { field: "scheduled_at", message: "Cannot schedule more than 1 year in advance" }
    }

    return null
  }

  static validateHashtags(hashtags: string[]): ValidationError | null {
    if (!hashtags) return null

    for (const hashtag of hashtags) {
      if (!hashtag.startsWith("#")) {
        return { field: "hashtags", message: "All hashtags must start with #" }
      }
      if (hashtag.length > 100) {
        return { field: "hashtags", message: "Hashtags must be less than 100 characters" }
      }
      if (!/^#[a-zA-Z0-9_]+$/.test(hashtag)) {
        return { field: "hashtags", message: "Hashtags can only contain letters, numbers, and underscores" }
      }
    }

    if (hashtags.length > 30) {
      return { field: "hashtags", message: "Maximum 30 hashtags allowed" }
    }

    return null
  }

  static validateMediaUrls(mediaUrls: string[]): ValidationError | null {
    if (!mediaUrls) return null

    if (mediaUrls.length > 10) {
      return { field: "media_urls", message: "Maximum 10 media files allowed" }
    }

    for (const url of mediaUrls) {
      try {
        new URL(url)
      } catch {
        return { field: "media_urls", message: "Invalid media URL format" }
      }
    }

    return null
  }

  static validateRequest(
    data: any,
    rules: { [key: string]: (value: any) => ValidationError | null },
  ): ValidationError[] {
    const errors: ValidationError[] = []

    for (const [field, validator] of Object.entries(rules)) {
      const error = validator(data[field])
      if (error) {
        errors.push(error)
      }
    }

    return errors
  }
}
