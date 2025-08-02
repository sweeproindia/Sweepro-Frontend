import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertCircle,
    Award,
    Calendar,
    Camera,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Settings,
    Shield,
    Star,
    User
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'maid';
  avatar: string;
  coverImage: string;
  location: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  rating?: number;
  totalBookings?: number;
  totalEarnings?: number;
  completedJobs?: number;
  specializations?: string[];
  bio?: string;
  address?: string;
  emergencyContact?: string;
  documents?: string[];
  achievements?: string[];
  recentActivity?: Array<{
    id: string;
    action: string;
    time: string;
    type: 'success' | 'info' | 'warning';
  }>;
}

// Sample profile data based on role
const getProfileData = (role: 'user' | 'admin' | 'maid'): ProfileData => {
  const baseData = {
    id: '1',
    name: '',
    email: '',
    phone: '',
    role,
    avatar: '',
    coverImage: '',
    location: '',
    joinDate: '',
    status: 'active' as const,
  };

  switch (role) {
    case 'user':
      return {
        ...baseData,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=300&fit=crop',
        location: 'Mumbai, Maharashtra',
        joinDate: 'March 2024',
        totalBookings: 24,
        bio: 'Homeowner looking for reliable cleaning services. Prefer eco-friendly products and thorough cleaning.',
        address: '123 Sunshine Apartments, Andheri West, Mumbai - 400058',
        emergencyContact: '+91 98765 43211 (Spouse)',
        recentActivity: [
          { id: '1', action: 'Booked weekly cleaning service', time: '2 hours ago', type: 'success' },
          { id: '2', action: 'Left 5-star review for last cleaning', time: '1 day ago', type: 'success' },
          { id: '3', action: 'Updated payment method', time: '3 days ago', type: 'info' },
        ]
      };

    case 'admin':
      return {
        ...baseData,
        name: 'Admin Manager',
        email: 'admin@cleanease.com',
        phone: '+91 98765 43212',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop',
        location: 'Bangalore, Karnataka',
        joinDate: 'January 2024',
        achievements: [
          'Successfully onboarded 50+ cleaning professionals',
          'Improved customer satisfaction by 25%',
          'Reduced service complaints by 40%',
          'Launched new mobile app features'
        ],
        recentActivity: [
          { id: '1', action: 'Approved 5 new maid applications', time: '1 hour ago', type: 'success' },
          { id: '2', action: 'Resolved customer complaint #1234', time: '3 hours ago', type: 'success' },
          { id: '3', action: 'Updated system maintenance schedule', time: '1 day ago', type: 'info' },
        ]
      };

    case 'maid':
      return {
        ...baseData,
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+91 98765 43213',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=300&fit=crop',
        location: 'Delhi, NCR',
        joinDate: 'February 2024',
        rating: 4.8,
        totalBookings: 156,
        totalEarnings: 45000,
        completedJobs: 142,
        specializations: ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Sanitization', 'Window Cleaning'],
        bio: 'Professional cleaner with 5+ years of experience. Specialized in deep cleaning and eco-friendly products. Committed to providing excellent service.',
        address: '456 Green Park, New Delhi - 110016',
        emergencyContact: '+91 98765 43214 (Family)',
        documents: ['Aadhar Card', 'Background Verification', 'Training Certificate', 'Insurance'],
        achievements: [
          'Top performer for 3 consecutive months',
          '100% customer satisfaction rating',
          'Completed advanced cleaning certification',
          'Received 50+ 5-star reviews'
        ],
        recentActivity: [
          { id: '1', action: 'Completed apartment cleaning at Sunshine Towers', time: '2 hours ago', type: 'success' },
          { id: '2', action: 'Received 5-star rating from client', time: '3 hours ago', type: 'success' },
          { id: '3', action: 'Updated availability for next week', time: '1 day ago', type: 'info' },
        ]
      };
  }
};

const ProfilePage: React.FC = () => {
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'maid'>('maid'); // Default to maid for demo
  const profileData = getProfileData(userRole);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5" />;
      case 'maid':
        return <MessageCircle className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <Card className="mb-6">
              <div className="relative">
                <img 
                  src={profileData.coverImage} 
                  alt="Cover" 
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <div className="absolute -bottom-12 left-6">
                  <div className="relative">
                    <img 
                      src={profileData.avatar} 
                      alt={profileData.name} 
                      className="w-24 h-24 rounded-full border-4 border-white object-cover"
                    />
                    <button className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full hover:bg-primary/90">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <CardContent className="pt-16">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    {getRoleIcon(profileData.role)}
                    <span className="text-sm text-gray-600 capitalize">{profileData.role}</span>
                    <Badge className={getStatusColor(profileData.status)}>
                      {profileData.status}
                    </Badge>
                  </div>
                  {profileData.rating && (
                    <div className="flex items-center justify-center space-x-1 mt-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{profileData.rating}</span>
                      <span className="text-sm text-gray-500">({profileData.totalBookings} reviews)</span>
                    </div>
                  )}
                </div>

                {profileData.bio && (
                  <p className="text-gray-600 text-sm text-center mb-4">{profileData.bio}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profileData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profileData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profileData.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Joined {profileData.joinDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {(profileData.totalBookings || profileData.totalEarnings || profileData.completedJobs) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData.totalBookings && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Total Bookings</span>
                      </div>
                      <span className="font-semibold">{profileData.totalBookings}</span>
                    </div>
                  )}
                  {profileData.completedJobs && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Completed Jobs</span>
                      </div>
                      <span className="font-semibold">{profileData.completedJobs}</span>
                    </div>
                  )}
                  {profileData.totalEarnings && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Total Earnings</span>
                      </div>
                      <span className="font-semibold">₹{profileData.totalEarnings.toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Specializations */}
            {profileData.specializations && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specializations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {profileData.achievements && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {profileData.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {profileData.documents && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profileData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{doc}</span>
                        <Badge variant="outline">Verified</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {profileData.recentActivity && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileData.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.address && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Address</h4>
                    <p className="text-sm text-gray-600">{profileData.address}</p>
                  </div>
                )}
                {profileData.emergencyContact && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Emergency Contact</h4>
                    <p className="text-sm text-gray-600">{profileData.emergencyContact}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 