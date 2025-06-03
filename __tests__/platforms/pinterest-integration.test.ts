import { PinterestIntegration } from '../../lib/platforms/pinterest-integration';
import { mockFetch } from '../mocks/fetch-mock';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    PINTEREST_CLIENT_ID: 'test-client-id',
    PINTEREST_CLIENT_SECRET: 'test-client-secret',
    PINTEREST_REDIRECT_URI: 'http://localhost:3000/api/auth/callback/pinterest'
  }
}));

// Mock fetch
vi.stubGlobal('fetch', mockFetch);

describe('PinterestIntegration', () => {
  let pinterestIntegration: PinterestIntegration;
  
  beforeEach(() => {
    pinterestIntegration = new PinterestIntegration();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAuthUrl', () => {
    it('should generate a valid OAuth URL with required scopes', () => {
      const scopes = ['boards:read', 'pins:read', 'pins:write'];
      const authUrl = pinterestIntegration.getAuthUrl(scopes);
      
      expect(authUrl).toContain('https://www.pinterest.com/oauth/');
      expect(authUrl).toContain('client_id=test-client-id');
      expect(authUrl).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fpinterest');
      expect(authUrl).toContain('response_type=code');
      
      // Check that all scopes are included
      const scopeParam = `scope=${scopes.join(',')}`;
      expect(authUrl).toContain(scopeParam);
    });

    it('should use default scopes if none provided', () => {
      const authUrl = pinterestIntegration.getAuthUrl();
      
      // Default scopes should be included
      expect(authUrl).toContain('scope=user_accounts:read');
    });
  });

  describe('handleAuthCallback', () => {
    it('should exchange code for access token successfully', async () => {
      // Mock successful token response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          scope: 'boards:read,pins:read,pins:write'
        })
      });

      // Mock user info response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'test-user-id',
            username: 'testuser'
          }
        })
      });

      const result = await pinterestIntegration.handleAuthCallback('test-code');
      
      expect(result).toEqual({
        success: true,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 3600,
        userId: 'test-user-id',
        scope: 'boards:read,pins:read,pins:write'
      });

      // Verify fetch was called with correct parameters for token exchange
      expect(fetch).toHaveBeenCalledWith(
        'https://api.pinterest.com/v5/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded'
          }),
          body: expect.stringContaining('client_id=test-client-id')
        })
      );
    });

    it('should handle error response from Pinterest API', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Invalid authorization code'
        })
      });

      await expect(pinterestIntegration.handleAuthCallback('invalid-code'))
        .rejects.toThrow('Failed to exchange code for token: Invalid authorization code');
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token successfully', async () => {
      // Mock successful refresh response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600
        })
      });

      const result = await pinterestIntegration.refreshToken('old-refresh-token');
      
      expect(result).toEqual({
        success: true,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600
      });
    });

    it('should handle error during token refresh', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Invalid refresh token'
        })
      });

      await expect(pinterestIntegration.refreshToken('invalid-refresh-token'))
        .rejects.toThrow('Failed to refresh token: Invalid refresh token');
    });
  });

  describe('publishPost', () => {
    it('should publish a pin successfully', async () => {
      // Mock successful board list response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { id: 'board-123', name: 'Test Board' }
          ]
        })
      });

      // Mock successful pin creation response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: 'pin-123',
            link: 'https://pinterest.com/pin/pin-123'
          }
        })
      });

      const postData = {
        content: 'Test Pinterest pin',
        mediaUrls: ['https://example.com/image.jpg'],
        title: 'Test Pin Title'
      };

      const result = await pinterestIntegration.publishPost('test-access-token', postData);
      
      expect(result).toEqual({
        success: true,
        postId: 'pin-123',
        platformPostId: 'pin-123',
        url: 'https://pinterest.com/pin/pin-123'
      });

      // Verify fetch was called with correct parameters for pin creation
      expect(fetch).toHaveBeenCalledWith(
        'https://api.pinterest.com/v5/pins',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-access-token',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('board_id')
        })
      );
    });

    it('should handle error when no boards are available', async () => {
      // Mock empty board list response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: []
        })
      });

      const postData = {
        content: 'Test Pinterest pin',
        mediaUrls: ['https://example.com/image.jpg']
      };

      await expect(pinterestIntegration.publishPost('test-access-token', postData))
        .rejects.toThrow('No boards found to create pin');
    });

    it('should handle error when publishing a pin', async () => {
      // Mock successful board list response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { id: 'board-123', name: 'Test Board' }
          ]
        })
      });

      // Mock error response for pin creation
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          code: 400,
          message: 'Invalid image URL'
        })
      });

      const postData = {
        content: 'Test Pinterest pin',
        mediaUrls: ['https://example.com/invalid.txt']
      };

      await expect(pinterestIntegration.publishPost('test-access-token', postData))
        .rejects.toThrow('Failed to publish pin to Pinterest: Invalid image URL');
    });
  });

  describe('deletePost', () => {
    it('should delete a pin successfully', async () => {
      // Mock successful delete response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      const result = await pinterestIntegration.deletePost('test-access-token', 'pin-123');
      
      expect(result).toEqual({
        success: true
      });

      // Verify fetch was called with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        'https://api.pinterest.com/v5/pins/pin-123',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-access-token'
          })
        })
      );
    });

    it('should handle error when deleting a pin', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          code: 404,
          message: 'Pin not found'
        })
      });

      await expect(pinterestIntegration.deletePost('test-access-token', 'non-existent-id'))
        .rejects.toThrow('Failed to delete pin from Pinterest: Pin not found');
    });
  });

  describe('getAccountMetrics', () => {
    it('should retrieve account metrics successfully', async () => {
      // Mock successful user analytics response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            metrics: {
              follower_count: 1000,
              pin_count: 50,
              board_count: 10,
              monthly_views: 5000
            }
          }
        })
      });

      const result = await pinterestIntegration.getAccountMetrics('test-access-token');
      
      expect(result).toEqual({
        success: true,
        metrics: {
          followers: 1000,
          posts: 50,
          boards: 10,
          views: 5000
        }
      });
    });

    it('should handle error when retrieving account metrics', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          code: 401,
          message: 'Invalid access token'
        })
      });

      await expect(pinterestIntegration.getAccountMetrics('invalid-token'))
        .rejects.toThrow('Failed to retrieve Pinterest account metrics: Invalid access token');
    });
  });

  describe('getPostMetrics', () => {
    it('should retrieve pin metrics successfully', async () => {
      // Mock successful pin analytics response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            metrics: {
              impression_count: 10000,
              save_count: 500,
              click_count: 250,
              engagement_rate: 0.05
            }
          }
        })
      });

      const result = await pinterestIntegration.getPostMetrics('test-access-token', 'pin-123');
      
      expect(result).toEqual({
        success: true,
        metrics: {
          impressions: 10000,
          saves: 500,
          clicks: 250,
          engagementRate: 0.05
        }
      });
    });

    it('should handle error when retrieving pin metrics', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          code: 404,
          message: 'Pin not found'
        })
      });

      await expect(pinterestIntegration.getPostMetrics('test-access-token', 'non-existent-id'))
        .rejects.toThrow('Failed to retrieve Pinterest pin metrics: Pin not found');
    });
  });
});