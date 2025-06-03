/**
 * Gemini AI Service
 * 
 * This module provides AI-powered content optimization using Google's Gemini API.
 * It offers functions for enhancing social media content, generating hashtags,
 * and analyzing content performance.
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export interface ContentOptimizationOptions {
  platform: string;
  targetAudience?: string;
  tone?: string;
  maxLength?: number;
  includeEmojis?: boolean;
  includeHashtags?: boolean;
  contentGoal?: 'engagement' | 'clicks' | 'awareness' | 'conversion';
}

export interface HashtagGenerationOptions {
  platform: string;
  count?: number;
  relevance?: 'high' | 'medium' | 'trending';
  includePopular?: boolean;
}

export interface ContentAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  estimatedEngagement: 'high' | 'medium' | 'low';
}

export class GeminiAIService {
  private model: GenerativeModel | null = null;
  private apiKey: string;
  private initialized: boolean = false;
  private platformDetails: Record<string, { content: string; character_count: number }> = {
    instagram: { content: "Instagram version", character_count: 2200 },
    facebook: { content: "Facebook version", character_count: 63206 },
    linkedin: { content: "LinkedIn version", character_count: 3000 },
    x: { content: "X version", character_count: 280 }
  };
  
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Gemini API key not configured. AI features will be simulated.');
    } else {
      this.initialize();
    }
  }
  
  /**
   * Initialize the Gemini AI model
   */
  private initialize(): void {
    try {
      if (!this.apiKey) return;
      
      const genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      this.initialized = true;
      
      console.log('Gemini AI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      this.initialized = false;
    }
  }
  
  /**
   * Optimize content for a specific social media platform
   */
  async optimizeContent(content: string, options: ContentOptimizationOptions): Promise<string> {
    try {
      if (!this.initialized || !this.model) {
        return this.simulateOptimizeContent(content, options);
      }
      
      const { platform, targetAudience, tone, maxLength, includeEmojis, includeHashtags, contentGoal } = options;
      
      const prompt = `
        Optimize the following social media content for ${platform}.
        
        Original content: "${content}"
        
        ${targetAudience ? `Target audience: ${targetAudience}` : ''}
        ${tone ? `Tone: ${tone}` : ''}
        ${maxLength ? `Maximum length: ${maxLength} characters` : ''}
        ${includeEmojis !== undefined ? `Include emojis: ${includeEmojis ? 'Yes' : 'No'}` : ''}
        ${includeHashtags !== undefined ? `Include hashtags: ${includeHashtags ? 'Yes' : 'No'}` : ''}
        ${contentGoal ? `Content goal: ${contentGoal}` : ''}
        
        Please provide only the optimized content without any explanations or additional text.
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const optimizedContent = response.text().trim();
      
      return optimizedContent;
    } catch (error) {
      console.error('Error optimizing content with Gemini AI:', error);
      return this.simulateOptimizeContent(content, options);
    }
  }
  
  /**
   * Generate hashtags for a specific social media platform
   */
  async generateHashtags(content: string, options: HashtagGenerationOptions): Promise<string[]> {
    try {
      if (!this.initialized || !this.model) {
        return this.simulateGenerateHashtags(content, options);
      }
      
      const { platform, count = 5, relevance = 'high', includePopular = true } = options;
      
      const prompt = `
        Generate ${count} hashtags for the following ${platform} content.
        
        Content: "${content}"
        
        Relevance level: ${relevance}
        Include popular hashtags: ${includePopular ? 'Yes' : 'No'}
        
        Please provide only the hashtags without any explanations or additional text.
        Format: Return a JSON array of hashtags without the # symbol.
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const hashtagsText = response.text().trim();
      
      // Parse the response as JSON array
      try {
        // Handle different response formats
        if (hashtagsText.startsWith('[') && hashtagsText.endsWith(']')) {
          const hashtags = JSON.parse(hashtagsText);
          return hashtags.map((tag: string) => tag.startsWith('#') ? tag : `#${tag}`);
        } else {
          // If not JSON, split by commas or spaces
          return hashtagsText
            .split(/[,\s]+/)
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
        }
      } catch (parseError) {
        console.error('Error parsing hashtags response:', parseError);
        return hashtagsText
          .split(/[,\s]+/)
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
      }
    } catch (error) {
      console.error('Error generating hashtags with Gemini AI:', error);
      return this.simulateGenerateHashtags(content, options);
    }
  }
  
  /**
   * Analyze content and provide feedback
   */
  async analyzeContent(content: string, platform: string): Promise<ContentAnalysisResult> {
    try {
      if (!this.initialized || !this.model) {
        return this.simulateAnalyzeContent(content, platform);
      }
      
      const prompt = `
        Analyze the following social media content for ${platform}.
        
        Content: "${content}"
        
        Provide a detailed analysis including:
        1. Overall score (0-100)
        2. Content strengths (list)
        3. Content weaknesses (list)
        4. Improvement suggestions (list)
        5. Overall sentiment (positive, neutral, or negative)
        6. Estimated engagement level (high, medium, or low)
        
        Format the response as a JSON object with the following structure:
        {
          "score": number,
          "strengths": [string],
          "weaknesses": [string],
          "suggestions": [string],
          "sentiment": "positive" | "neutral" | "negative",
          "estimatedEngagement": "high" | "medium" | "low"
        }
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const analysisText = response.text().trim();
      
      try {
        // Extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            score: analysis.score || 0,
            strengths: analysis.strengths || [],
            weaknesses: analysis.weaknesses || [],
            suggestions: analysis.suggestions || [],
            sentiment: analysis.sentiment || 'neutral',
            estimatedEngagement: analysis.estimatedEngagement || 'medium'
          };
        }
        throw new Error('Could not extract JSON from response');
      } catch (parseError) {
        console.error('Error parsing content analysis response:', parseError);
        return this.simulateAnalyzeContent(content, platform);
      }
    } catch (error) {
      console.error('Error analyzing content with Gemini AI:', error);
      return this.simulateAnalyzeContent(content, platform);
    }
  }
  
  /**
   * Simulate content optimization for development/testing
   */
  private simulateOptimizeContent(content: string, options: ContentOptimizationOptions): string {
    const { platform, includeEmojis, includeHashtags } = options;
    
    // Simple simulation logic
    let optimized = content;
    
    // Add platform-specific enhancements
    switch (platform.toLowerCase()) {
      case 'instagram':
        optimized = `✨ ${optimized} ✨`;
        if (includeHashtags) {
          optimized += ' #instagram #photooftheday #instagood';
        }
        break;

        case 'x':
          // Keep it concise for X
        if (optimized.length > 200) {
          optimized = optimized.substring(0, 197) + '...';
        }
        if (includeHashtags) {
          optimized += ' #tweet #trending';
        }
        break;
      case 'facebook':
        if (includeEmojis) {
          optimized = `👋 ${optimized} 👍`;
        }
        break;
      case 'linkedin':
        // More professional tone for LinkedIn
        optimized = `Sharing: ${optimized}`;
        if (includeHashtags) {
          optimized += ' #networking #professional #career';
        }
        break;
    }
    
    return optimized;
  }
  
  /**
   * Simulate hashtag generation for development/testing
   */
  private simulateGenerateHashtags(content: string, options: HashtagGenerationOptions): string[] {
    const { platform, count = 5 } = options;
    
    // Common hashtags by platform
    const hashtagsByPlatform: Record<string, string[]> = {
      instagram: ['#instagram', '#instagood', '#photooftheday', '#love', '#fashion', '#beautiful', '#art', '#photography', '#happy', '#cute', '#travel', '#style', '#followme', '#picoftheday', '#nature', '#selfie', '#summer', '#smile', '#food', '#friends'],
      x: ['#tweet', '#trending', '#followback', '#news', '#viral', '#socialmedia', '#follow', '#retweet', '#tbt', '#tweetoftheday'],
      facebook: ['#facebook', '#share', '#like', '#follow', '#community', '#friends', '#family', '#memories', '#events', '#fbupdate'],
      linkedin: ['#networking', '#jobs', '#career', '#business', '#leadership', '#success', '#innovation', '#entrepreneurship', '#marketing', '#technology', '#professional', '#work', '#hr', '#management']
    };
    
    // Get hashtags for the platform or use generic ones
    const platformTags = hashtagsByPlatform[platform.toLowerCase()] || ['#social', '#media', '#content', '#digital', '#trending'];
    
    // Randomly select 'count' hashtags
    const selectedTags: string[] = [];
    const maxTags = Math.min(count, platformTags.length);
    
    while (selectedTags.length < maxTags) {
      const randomIndex = Math.floor(Math.random() * platformTags.length);
      const tag = platformTags[randomIndex];
      
      if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
      }
    }
    
    return selectedTags;
  }
  
  /**
   * Simulate content analysis for development/testing
   */
  private simulateAnalyzeContent(content: string, platform: string): ContentAnalysisResult {
    // Generate a random score between 60 and 95
    const score = Math.floor(Math.random() * 36) + 60;
    
    // Determine engagement level based on score
    let estimatedEngagement: 'high' | 'medium' | 'low';
    if (score >= 85) estimatedEngagement = 'high';
    else if (score >= 70) estimatedEngagement = 'medium';
    else estimatedEngagement = 'low';
    
    // Determine sentiment based on content
    let sentiment: 'positive' | 'neutral' | 'negative';
    const positiveWords = ['great', 'happy', 'excellent', 'amazing', 'good', 'love', 'best', 'awesome'];
    const negativeWords = ['bad', 'sad', 'terrible', 'awful', 'worst', 'hate', 'poor', 'disappointing'];
    
    const contentLower = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => contentLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => contentLower.includes(word)).length;
    
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
    else sentiment = 'neutral';
    
    // Generic strengths, weaknesses, and suggestions
    const strengths = [
      'Clear message',
      'Good use of keywords',
      'Appropriate length for the platform'
    ];
    
    const weaknesses = [
      'Could use more engaging language',
      'Missing call to action',
      'Limited use of platform-specific features'
    ];
    
    const suggestions = [
      'Add a clear call to action',
      'Include relevant hashtags',
      'Consider adding visual elements',
      'Ask a question to encourage engagement'
    ];
    
    // Platform-specific suggestions
    switch (platform.toLowerCase()) {
      case 'instagram':
        suggestions.push('Add more visually descriptive language');
        suggestions.push('Include more relevant hashtags');
        break;

      case 'x':
        suggestions.push('Use strong hooks to grab attention.');
        suggestions.push('Keep it concise and to the point.');
        suggestions.push('Utilize relevant hashtags to increase visibility.');
        suggestions.push('Engage with replies and mentions.');
        suggestions.push('Post consistently during peak hours.');
        break;
      case 'facebook':
        suggestions.push('Consider adding more personal elements');
        suggestions.push('Ask for audience opinions');
        break;
      case 'linkedin':
        suggestions.push('Add more professional context');
        suggestions.push('Reference industry trends');
        break;
    }
    
    return {
      score,
      strengths,
      weaknesses,
      suggestions,
      sentiment,
      estimatedEngagement
    };
  }
}