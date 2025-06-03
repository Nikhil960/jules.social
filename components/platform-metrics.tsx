'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "./ui/skeleton";

type MetricsData = {
  platform: string;
  metrics: {
    followers: number;
    engagement: number;
    posts: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  history: {
    date: string;
    followers: number;
    engagement: number;
    posts: number;
  }[];
};

type PlatformMetricsProps = {
  accountId?: string;
  platformId?: string;
};

export default function PlatformMetrics({ accountId, platformId }: PlatformMetricsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [activeTab, setActiveTab] = useState('followers');

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!accountId && !platformId) {
        setError('Account ID or Platform ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, this would be an API call
        // const response = await fetch(`/api/metrics?accountId=${accountId}&platformId=${platformId}`);
        // const data = await response.json();
        
        // For now, we'll use mock data
        setTimeout(() => {
          const mockData: MetricsData = {
            platform: platformId || 'facebook',
            metrics: {
              followers: 1250,
              engagement: 3.2,
              posts: 45,
              views: 12500,
              likes: 850,
              comments: 320,
              shares: 125
            },
            history: [
              { date: '2023-01', followers: 1000, engagement: 2.8, posts: 30 },
              { date: '2023-02', followers: 1050, engagement: 2.9, posts: 32 },
              { date: '2023-03', followers: 1100, engagement: 3.0, posts: 35 },
              { date: '2023-04', followers: 1150, engagement: 3.1, posts: 38 },
              { date: '2023-05', followers: 1200, engagement: 3.2, posts: 42 },
              { date: '2023-06', followers: 1250, engagement: 3.2, posts: 45 }
            ]
          };
          
          setMetricsData(mockData);
          setLoading(false);
        }, 1500);
      } catch (err) {
        setError('Failed to fetch metrics data');
        setLoading(false);
        console.error('Error fetching metrics:', err);
      }
    };

    fetchMetrics();
  }, [accountId, platformId]);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Metrics</CardTitle>
        <CardDescription>
          {loading ? 'Loading metrics...' : `Analytics for ${metricsData?.platform}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : (
          <>
            <Tabs defaultValue="followers" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="followers">Followers</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
              </TabsList>
              
              {['followers', 'engagement', 'posts'].map((metric) => (
                <TabsContent key={metric} value={metric} className="space-y-4">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metricsData?.history}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar 
                          dataKey={metric} 
                          fill={metric === 'followers' ? '#3b82f6' : 
                                metric === 'engagement' ? '#10b981' : '#f59e0b'} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <MetricCard 
                      title="Total" 
                      value={metricsData?.metrics[metric as keyof typeof metricsData.metrics] || 0} 
                      unit={metric === 'engagement' ? '%' : ''} 
                    />
                    <MetricCard 
                      title="Views" 
                      value={metricsData?.metrics.views || 0} 
                    />
                    <MetricCard 
                      title="Likes" 
                      value={metricsData?.metrics.likes || 0} 
                    />
                    <MetricCard 
                      title="Comments" 
                      value={metricsData?.metrics.comments || 0} 
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({ title, value, unit = '' }: { title: string; value: number; unit?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold">
        {value.toLocaleString()}{unit}
      </div>
    </div>
  );
}