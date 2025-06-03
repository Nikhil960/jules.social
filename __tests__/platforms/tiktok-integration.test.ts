import { TikTokIntegration } from '../../lib/platforms/tiktok-integration';
import { mockFetch } from '../mocks/fetch-mock';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    TIKTOK_CLIENT_ID: 'test-client-id',
    TIKTOK_CLIENT_SECRET: 'test-client-secret',
    TIKTOK_REDIRECT_URI: 'http://localhost:3000/api/auth/callback/tiktok'
  }
}));

// Mock fetch
vi.stubGlobal('fetch', mockFetch);

describe('TikTokIntegration', () => {
  let tiktokIntegration: TikTokIntegration;
  
  beforeEach(() => {
    tiktokIntegration = new TikTokIntegration();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAuthUrl', () => {
    it('should generate a valid OAuth URL with required scopes', () => {
      const scopes = ['user.info.basic', 'video.list', 'video.upload'];
      const authUrl = tiktokIntegration.getAuthUrl(scopes);
      
      expect(authUrl).toContain('https://www.tiktok.com/auth/authorize/');
      expect(authUrl).toContain('client_key=test-client-id');
      expect(authUrl).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Ftiktok');
      expect(authUrl).toContain('response_type=code');
      
      // Check that all scopes are included
      for (const scope of scopes) {
        expect(authUrl).toContain(`scope=${scope}`);
      }
    });

    it('should use default scopes if none provided', () => {
      const authUrl = tiktokIntegration.getAuthUrl();
      
      // Default scopes should be included
      expect(authUrl).toContain('scope=user.info.basic');
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
          open_id: 'test-open-id',
          scope: 'user.info.basic,video.list'
        })
      });

      const result = await tiktokIntegration.handleAuthCallback('test-code');
      
      expect(result).toEqual({
        success: true,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 3600,
        userId: 'test-open-id',
        scope: 'user.info.basic,video.list'
      });

      // Verify fetch was called with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        'https://open.tiktokapis.com/v2/oauth/token/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded'
          }),
          body: expect.stringContaining('client_key=test-client-id')
        })
      );
    });

    it('should handle error response from TikTok API', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Invalid authorization code'
        })
      });

      await expect(tiktokIntegration.handleAuthCallback('invalid-code'))
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

      const result = await tiktokIntegration.refreshToken('old-refresh-token');
      
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

      await expect(tiktokIntegration.refreshToken('invalid-refresh-token'))
        .rejects.toThrow('Failed to refresh token: Invalid refresh token');
    });
  });

  describe('publishPost', () => {
    it('should publish a post successfully', async () => {
      // Mock successful publish response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            video_id: 'test-video-id',
            share_id: 'test-share-id'
          }
        })
      });

      const postData = {
        content: 'Test TikTok post',
        mediaUrls: ['https://example.com/video.mp4']
      };

      const result = await tiktokIntegration.publishPost('test-access-token', postData);
      
      expect(result).toEqual({
        success: true,
        postId: 'test-video-id',
        platformPostId: 'test-share-id'
      });
    });

    it('should handle error when publishing a post', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            code: 'invalid_parameter',
            message: 'Invalid video format'
          }
        })
      });

      const postData = {
        content: 'Test TikTok post',
        mediaUrls: ['https://example.com/invalid.txt']
      };

      await expect(tiktokIntegration.publishPost('test-access-token', postData))
        .rejects.toThrow('Failed to publish post to TikTok: Invalid video format');
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      // Mock successful delete response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { success: true }
        })
      });

      const result = await tiktokIntegration.deletePost('test-access-token', 'test-post-id');
      
      expect(result).toEqual({
        success: true
      });
    });

    it('should handle error when deleting a post', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: {
            code: 'not_found',
            message: 'Video not found'
          }
        })
      });

      await expect(tiktokIntegration.deletePost('test-access-token', 'non-existent-id'))
        .rejects.toThrow('Failed to delete post from TikTok: Video not found');
    });
  });

  describe('getAccountMetrics', () => {
    it('should retrieve account metrics successfully', async () => {
      // Mock successful metrics response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            metrics: {
              follower_count: 1000,
              following_count: 500,
              likes_count: 5000,
              video_count: 50
            }
          }
        })
      });

      const result = await tiktokIntegration.getAccountMetrics('test-access-token');
      
      expect(result).toEqual({
        success: true,
        metrics: {
          followers: 1000,
          following: 500,
          likes: 5000,
          posts: 50
        }
      });
    });

    it('should handle error when retrieving account metrics', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            code: 'access_denied',
            message: 'Invalid access token'
          }
        })
      });

      await expect(tiktokIntegration.getAccountMetrics('invalid-token'))
        .rejects.toThrow('Failed to retrieve TikTok account metrics: Invalid access token');
    });
  });

  describe('getPostMetrics', () => {
    it('should retrieve post metrics successfully', async () => {
      // Mock successful post metrics response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            metrics: {
              view_count: 10000,
              like_count: 500,
              comment_count: 50,
              share_count: 25
            }
          }
        })
      });

      const result = await tiktokIntegration.getPostMetrics('test-access-token', 'test-post-id');
      
      expect(result).toEqual({
        success: true,
        metrics: {
          views: 10000,
          likes: 500,
          comments: 50,
          shares: 25
        }
      });
    });

    it('should handle error when retrieving post metrics', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: {
            code: 'not_found',
            message: 'Video not found'
          }
        })
      });

      await expect(tiktokIntegration.getPostMetrics('test-access-token', 'non-existent-id'))
        .rejects.toThrow('Failed to retrieve TikTok post metrics: Video not found');
    });
  });
});