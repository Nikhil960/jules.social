/**
 * Platform Factory
 * 
 * This module implements a factory pattern for managing different social media platform integrations.
 * It provides a unified interface for platform-specific operations like authentication, posting,
 * and metrics retrieval.
 */

import { XIntegration } from './twitter-integration';
import { InstagramIntegration } from './instagram-integration';
import { LinkedInIntegration } from './linkedin-integration';
import { FacebookIntegration } from './facebook-integration';
import { TikTokIntegration } from './tiktok-integration';
import { PinterestIntegration } from './pinterest-integration';

/**
 * Interface for platform-specific integrations
 */
export interface PlatformIntegration {
  // Authentication methods
  getAuthUrl(): string;
  handleAuthCallback(code: string): Promise<any>;
  refreshToken(refreshToken: string): Promise<any>;
  
  // Post management methods
  publishPost(accountId: string, content: string, mediaUrls?: string[]): Promise<any>;
  deletePost(accountId: string, postId: string): Promise<boolean>;
  
  // Metrics methods
  getAccountMetrics(accountId: string): Promise<any>;
  getPostMetrics(accountId: string, postId: string): Promise<any>;
}

/**
 * Platform configuration requirements
 */
export interface PlatformConfigRequirements {
  clientId: boolean;
  clientSecret: boolean;
  redirectUri: boolean;
  apiKey?: boolean;
  apiSecret?: boolean;
  additionalScopes?: string[];
}

/**
 * Factory class for creating platform-specific integrations
 */
export class PlatformFactory {
  private static platforms: Record<string, any> = {
    x: XIntegration,
    instagram: InstagramIntegration,
    linkedin: LinkedInIntegration,
    facebook: FacebookIntegration,
    tiktok: TikTokIntegration,
    pinterest: PinterestIntegration
  };
  
  /**
   * Creates a platform-specific integration instance
   */
  static createPlatformIntegration(platform: string): PlatformIntegration {
    const PlatformClass = this.platforms[platform.toLowerCase()];
    
    if (!PlatformClass) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    
    return new PlatformClass();
  }
  
  /**
   * Lists all supported platforms
   */
  static getSupportedPlatforms(): string[] {
    return Object.keys(this.platforms).filter(p => p !== 'x'); // Filter out alias
  }
  
  /**
   * Checks if a platform is supported
   */
  static isPlatformSupported(platform: string): boolean {
    return !!this.platforms[platform.toLowerCase()];
  }
  
  /**
   * Gets configuration requirements for a specific platform
   */
  static getPlatformConfigRequirements(platform: string): PlatformConfigRequirements {
    const platformLower = platform.toLowerCase();
    
    // Default requirements
    const defaultRequirements: PlatformConfigRequirements = {
      clientId: true,
      clientSecret: true,
      redirectUri: true
    };
    
    // Platform-specific requirements
    switch (platformLower) {
      case 'twitter':
      case 'x':
        return {
          ...defaultRequirements,
          apiKey: true,
          apiSecret: true
        };
      case 'instagram':
        return defaultRequirements;
      case 'linkedin':
        return {
          ...defaultRequirements,
          additionalScopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social']
        };
      case 'facebook':
        return {
          ...defaultRequirements,
          additionalScopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts']
        };
      case 'tiktok':
        return {
          ...defaultRequirements,
          additionalScopes: ['user.info.basic', 'video.list', 'video.upload', 'video.publish']
        };
      case 'pinterest':
        return {
          ...defaultRequirements,
          additionalScopes: ['boards:read', 'boards:write', 'pins:read', 'pins:write']
        };
      default:
        return defaultRequirements;
    }
  }
}