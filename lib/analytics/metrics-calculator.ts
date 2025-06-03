/**
 * MetricsCalculator provides methods for calculating various analytics metrics
 * based on raw social media data.
 */

export interface MetricsData {
  id?: string;
  account_id?: string;
  post_id?: string;
  timestamp?: string;
  followers?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  impressions?: number;
  reach?: number;
  clicks?: number;
  profile_visits?: number;
}

export interface CalculatedMetrics {
  engagement_rate: number;
  engagement_score: number;
  virality_score: number;
  quality_score: number;
}

export class MetricsCalculator {
  /**
   * Calculates the engagement rate based on a collection of metrics
   * Engagement rate = (likes + comments + shares) / followers * 100
   */
  static calculateEngagementRate(metrics: MetricsData[]): number {
    if (!metrics || metrics.length === 0) return 0;
    
    // Use the latest metrics for calculation
    const latestMetrics = metrics[metrics.length - 1];
    
    if (!latestMetrics.followers || latestMetrics.followers === 0) return 0;
    
    const interactions = (
      (latestMetrics.likes || 0) + 
      (latestMetrics.comments || 0) + 
      (latestMetrics.shares || 0)
    );
    
    return (interactions / latestMetrics.followers) * 100;
  }
  
  /**
   * Calculates the average engagement across multiple metrics entries
   */
  static calculateAverageEngagement(metrics: MetricsData[]): number {
    if (!metrics || metrics.length === 0) return 0;
    
    const totalEngagement = metrics.reduce((sum, metric) => {
      const followers = metric.followers || 1; // Prevent division by zero
      const interactions = (
        (metric.likes || 0) + 
        (metric.comments || 0) + 
        (metric.shares || 0)
      );
      
      return sum + ((interactions / followers) * 100);
    }, 0);
    
    return totalEngagement / metrics.length;
  }
  
  /**
   * Calculates an engagement score that weights different types of engagement
   * Likes = 1x, Comments = 2x, Shares = 3x, Saves = 2x
   */
  static calculateEngagementScore(metrics: MetricsData[]): number {
    if (!metrics || metrics.length === 0) return 0;
    
    // Use the latest metrics for calculation
    const latestMetrics = metrics[metrics.length - 1];
    
    return (
      (latestMetrics.likes || 0) * 1 + 
      (latestMetrics.comments || 0) * 2 + 
      (latestMetrics.shares || 0) * 3 + 
      (latestMetrics.saves || 0) * 2
    );
  }
  
  /**
   * Calculates a virality score based on shares and reach
   */
  static calculateViralityScore(metrics: MetricsData[]): number {
    if (!metrics || metrics.length === 0) return 0;
    
    // Use the latest metrics for calculation
    const latestMetrics = metrics[metrics.length - 1];
    
    if (!latestMetrics.reach || latestMetrics.reach === 0) return 0;
    
    // Virality = (shares / reach) * 100 * multiplier
    const multiplier = 10; // Amplify the score for better readability
    return ((latestMetrics.shares || 0) / latestMetrics.reach) * 100 * multiplier;
  }
  
  /**
   * Calculates a quality score based on multiple engagement factors
   */
  static calculateQualityScore(metrics: MetricsData[]): number {
    if (!metrics || metrics.length === 0) return 0;
    
    // Use the latest metrics for calculation
    const latestMetrics = metrics[metrics.length - 1];
    
    // Calculate comment-to-like ratio (higher ratio = more meaningful engagement)
    const commentToLikeRatio = latestMetrics.likes && latestMetrics.likes > 0 
      ? (latestMetrics.comments || 0) / latestMetrics.likes 
      : 0;
    
    // Calculate save-to-like ratio (higher ratio = more valuable content)
    const saveToLikeRatio = latestMetrics.likes && latestMetrics.likes > 0 
      ? (latestMetrics.saves || 0) / latestMetrics.likes 
      : 0;
    
    // Calculate click-through rate if available
    const ctr = latestMetrics.impressions && latestMetrics.impressions > 0 
      ? (latestMetrics.clicks || 0) / latestMetrics.impressions 
      : 0;
    
    // Weighted quality score (scale 0-100)
    return Math.min(100, (
      (commentToLikeRatio * 25) + 
      (saveToLikeRatio * 25) + 
      (ctr * 50) + 
      (this.calculateEngagementRate([latestMetrics]) * 0.5)
    ));
  }
  
  /**
   * Calculates growth rate between two metric points
   */
  static calculateGrowthRate(oldMetrics: MetricsData, newMetrics: MetricsData, field: keyof MetricsData): number {
    const oldValue = oldMetrics[field] as number || 0;
    const newValue = newMetrics[field] as number || 0;
    
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    
    return ((newValue - oldValue) / oldValue) * 100;
  }
  
  /**
   * Calculates all metrics in one call
   */
  static calculateAllMetrics(metrics: MetricsData[]): CalculatedMetrics {
    return {
      engagement_rate: this.calculateEngagementRate(metrics),
      engagement_score: this.calculateEngagementScore(metrics),
      virality_score: this.calculateViralityScore(metrics),
      quality_score: this.calculateQualityScore(metrics)
    };
  }
}
