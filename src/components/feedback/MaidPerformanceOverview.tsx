import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MaidAnalytics {
  currentRating: number;
  totalRatings: number;
  platformAverage: number;
  comparisonWithPlatform: number;
  distribution: Record<number, number>;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    positivePercentage: number;
  };
  subRatings: {
    quality: number | null;
    punctuality: number | null;
    behavior: number | null;
  };
  feedbackCounts: {
    active: number;
    disputed: number;
    resolved: number;
    removed: number;
    total: number;
  };
  monthlyTrend: Array<{
    month: number;
    year: number;
    averageRating: number;
    feedbackCount: number;
  }>;
  trend: {
    direction: string;
    change: number;
    percentage: number;
  };
}

interface MaidPerformanceOverviewProps {
  maidId: string;
  maidName: string;
  analytics: MaidAnalytics;
  onRecalculate?: () => void;
}

const MaidPerformanceOverview: React.FC<MaidPerformanceOverviewProps> = ({
  maidId,
  maidName,
  analytics,
  onRecalculate
}) => {
  const getTrendIcon = () => {
    if (analytics.trend.direction === 'IMPROVING') {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (analytics.trend.direction === 'DECLINING') {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const chartData = analytics.monthlyTrend.map(m => ({
    name: `${m.month}/${m.year}`,
    rating: m.averageRating,
    count: m.feedbackCount
  }));

  const distributionData = [
    { rating: '5★', count: analytics.distribution[5], fill: '#22c55e' },
    { rating: '4★', count: analytics.distribution[4], fill: '#84cc16' },
    { rating: '3★', count: analytics.distribution[3], fill: '#eab308' },
    { rating: '2★', count: analytics.distribution[2], fill: '#f97316' },
    { rating: '1★', count: analytics.distribution[1], fill: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Rating */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{maidName} - Performance Overview</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Based on {analytics.totalRatings} ratings</p>
            </div>
            {onRecalculate && (
              <Button variant="outline" size="sm" onClick={onRecalculate}>
                Recalculate
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Current Rating */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Current Rating</p>
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${getRatingColor(analytics.currentRating)}`}>
                  {analytics.currentRating.toFixed(1)}
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <= Math.round(analytics.currentRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Comparison */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">vs Platform Avg</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {analytics.comparisonWithPlatform > 0 ? '+' : ''}
                  {analytics.comparisonWithPlatform.toFixed(2)}
                </span>
                {getTrendIcon()}
              </div>
              <p className="text-xs text-muted-foreground">
                Platform: {analytics.platformAverage.toFixed(1)}
              </p>
            </div>

            {/* Trend */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">30-Day Trend</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{analytics.trend.direction}</span>
                <Badge variant="outline">
                  {analytics.trend.percentage > 0 ? '+' : ''}
                  {analytics.trend.percentage}%
                </Badge>
              </div>
            </div>

            {/* Total Feedback */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{analytics.totalRatings}</span>
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment & Feedback Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sentiment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" />
              Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Positive (4-5 ★)</span>
                  <span className="text-sm font-bold text-green-600">
                    {analytics.sentiment.positivePercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${analytics.sentiment.positivePercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.sentiment.positive} reviews
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Neutral (3 ★)</span>
                  <span className="text-sm font-bold text-yellow-600">
                    {((analytics.sentiment.neutral / analytics.feedbackCounts.active) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${(analytics.sentiment.neutral / analytics.feedbackCounts.active) * 100}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.sentiment.neutral} reviews
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Negative (1-2 ★)</span>
                  <span className="text-sm font-bold text-red-600">
                    {((analytics.sentiment.negative / analytics.feedbackCounts.active) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${(analytics.sentiment.negative / analytics.feedbackCounts.active) * 100}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.sentiment.negative} reviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Status */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active</span>
                <Badge variant="outline" className="bg-green-50">
                  {analytics.feedbackCounts.active}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Disputed</span>
                <Badge variant="outline" className="bg-orange-50">
                  {analytics.feedbackCounts.disputed}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Resolved</span>
                <Badge variant="outline" className="bg-blue-50">
                  {analytics.feedbackCounts.resolved}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Removed</span>
                <Badge variant="outline" className="bg-red-50">
                  {analytics.feedbackCounts.removed}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Ratings */}
      {(analytics.subRatings.quality || analytics.subRatings.punctuality || analytics.subRatings.behavior) && (
        <Card>
          <CardHeader>
            <CardTitle>Category Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {analytics.subRatings.quality && (
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">Quality</p>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i <= Math.round(analytics.subRatings.quality || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold">{analytics.subRatings.quality.toFixed(1)}</span>
                </div>
              )}
              {analytics.subRatings.punctuality && (
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">Punctuality</p>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i <= Math.round(analytics.subRatings.punctuality || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold">{analytics.subRatings.punctuality.toFixed(1)}</span>
                </div>
              )}
              {analytics.subRatings.behavior && (
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">Behavior</p>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i <= Math.round(analytics.subRatings.behavior || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold">{analytics.subRatings.behavior.toFixed(1)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>6-Month Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" domain={[0, 5]} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="rating"
                stroke="#8884d8"
                name="Avg Rating"
                connectNulls
              />
              <Bar yAxisId="right" dataKey="count" fill="#82ca9d" name="Feedback Count" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaidPerformanceOverview;
