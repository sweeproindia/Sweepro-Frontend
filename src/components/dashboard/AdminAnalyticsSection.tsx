import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Shield, Calendar, DollarSign } from 'lucide-react';

interface AnalyticsData {
  totalBookings: number;
  totalCustomers: number;
  totalMaids: number;
  totalRevenue: number;
  monthlyGrowth: number;
  customerGrowth: number;
  maidGrowth: number;
  revenueGrowth: number;
}

interface AdminAnalyticsSectionProps {
  analyticsData: AnalyticsData;
}

export const AdminAnalyticsSection: React.FC<AdminAnalyticsSectionProps> = ({
  analyticsData,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-success' : 'text-destructive';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? '↗️' : '↘️';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.totalBookings)}</div>
            <p className={`text-xs flex items-center gap-1 ${getGrowthColor(analyticsData.monthlyGrowth)}`}>
              {getGrowthIcon(analyticsData.monthlyGrowth)} {Math.abs(analyticsData.monthlyGrowth)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.totalCustomers)}</div>
            <p className={`text-xs flex items-center gap-1 ${getGrowthColor(analyticsData.customerGrowth)}`}>
              {getGrowthIcon(analyticsData.customerGrowth)} {Math.abs(analyticsData.customerGrowth)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Homecare Partners</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.totalMaids)}</div>
            <p className={`text-xs flex items-center gap-1 ${getGrowthColor(analyticsData.maidGrowth)}`}>
              {getGrowthIcon(analyticsData.maidGrowth)} {Math.abs(analyticsData.maidGrowth)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalRevenue)}</div>
            <p className={`text-xs flex items-center gap-1 ${getGrowthColor(analyticsData.revenueGrowth)}`}>
              {getGrowthIcon(analyticsData.revenueGrowth)} {Math.abs(analyticsData.revenueGrowth)}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Booking Performance
            </CardTitle>
            <CardDescription>Monthly booking trends and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Bookings per Day</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(analyticsData.totalBookings / 30)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm text-success">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Customer Satisfaction</span>
                <span className="text-sm text-success">4.8/5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Booking Value</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(analyticsData.totalRevenue / analyticsData.totalBookings)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Growth Metrics
            </CardTitle>
            <CardDescription>Platform growth and expansion metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Customer Acquisition</span>
                <span className={`text-sm ${getGrowthColor(analyticsData.customerGrowth)}`}>
                  {analyticsData.customerGrowth > 0 ? '+' : ''}{analyticsData.customerGrowth}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Revenue Growth</span>
                <span className={`text-sm ${getGrowthColor(analyticsData.revenueGrowth)}`}>
                  {analyticsData.revenueGrowth > 0 ? '+' : ''}{analyticsData.revenueGrowth}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Homecare Partner Recruitment</span>
                <span className={`text-sm ${getGrowthColor(analyticsData.maidGrowth)}`}>
                  {analyticsData.maidGrowth > 0 ? '+' : ''}{analyticsData.maidGrowth}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Market Penetration</span>
                <span className="text-sm text-muted-foreground">15.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg hover:bg-muted cursor-pointer">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">View Bookings</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted cursor-pointer">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Manage Users</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted cursor-pointer">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Verify Homecare Partners</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted cursor-pointer">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Payment Reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 