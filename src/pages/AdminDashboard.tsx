import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3,
    Calendar,
    DollarSign,
    Shield,
    Users,
    TrendingUp
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AdminBookingsSection } from '@/components/dashboard/AdminBookingsSection';
import { AdminSubscriptionsSection } from '@/components/dashboard/AdminSubscriptionsSection';
import { AdminPaymentsSection } from '@/components/dashboard/AdminPaymentsSection';
import { AdminUsersSection } from '@/components/dashboard/AdminUsersSection';
import { AdminMaidsSection } from '@/components/dashboard/AdminMaidsSection';
import { AdminAnalyticsSection } from '@/components/dashboard/AdminAnalyticsSection';

// Mock data for pending bookings
const pendingBookings = [
  {
    id: 'BK001',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com',
    service: 'Deep Cleaning',
    date: '2024-01-15',
    time: '10:00 AM',
    address: '123 Main St, City',
    price: 1200,
    status: 'pending' as const
  },
  {
    id: 'BK002',
    customerName: 'Mike Chen',
    customerEmail: 'mike.chen@email.com',
    service: 'Regular Cleaning',
    date: '2024-01-16',
    time: '2:00 PM',
    address: '456 Oak Ave, City',
    price: 800,
    status: 'pending' as const
  },
  {
    id: 'BK003',
    customerName: 'Emily Davis',
    customerEmail: 'emily.d@email.com',
    service: 'Kitchen Deep Clean',
    date: '2024-01-17',
    time: '9:00 AM',
    address: '789 Pine Rd, City',
    price: 950,
    status: 'pending' as const
  },
  {
    id: 'BK004',
    customerName: 'Alex Thompson',
    customerEmail: 'alex.t@email.com',
    service: 'Bathroom Deep Clean',
    date: '2024-01-18',
    time: '11:00 AM',
    address: '321 Elm St, City',
    price: 750,
    status: 'pending' as const
  },
  {
    id: 'BK005',
    customerName: 'Jessica Lee',
    customerEmail: 'jessica.l@email.com',
    service: 'Full House Cleaning',
    date: '2024-01-19',
    time: '8:00 AM',
    address: '654 Maple Dr, City',
    price: 1500,
    status: 'pending' as const
  },
  {
    id: 'BK006',
    customerName: 'Robert Wilson',
    customerEmail: 'robert.w@email.com',
    service: 'Carpet Cleaning',
    date: '2024-01-20',
    time: '3:00 PM',
    address: '987 Cedar Ln, City',
    price: 1100,
    status: 'pending' as const
  }
];

// Mock data for confirmed bookings
const confirmedBookings = [
  {
    id: 'BK007',
    customerName: 'Lisa Anderson',
    customerEmail: 'lisa.a@email.com',
    service: 'Regular Cleaning',
    date: '2024-01-14',
    time: '1:00 PM',
    address: '111 First St, City',
    price: 800,
    status: 'confirmed' as const,
    assignedMaid: 'Maria Garcia'
  },
  {
    id: 'BK008',
    customerName: 'David Brown',
    customerEmail: 'david.b@email.com',
    service: 'Deep Cleaning',
    date: '2024-01-13',
    time: '10:00 AM',
    address: '222 Second Ave, City',
    price: 1200,
    status: 'confirmed' as const,
    assignedMaid: 'Ana Rodriguez'
  },
  {
    id: 'BK009',
    customerName: 'Jennifer White',
    customerEmail: 'jennifer.w@email.com',
    service: 'Kitchen Cleaning',
    date: '2024-01-12',
    time: '2:00 PM',
    address: '333 Third Rd, City',
    price: 950,
    status: 'confirmed' as const,
    assignedMaid: 'Sofia Martinez'
  }
];

// Mock data for subscriptions
const subscriptions = [
  {
    id: 'SUB001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    plan: 'Premium Monthly',
    status: 'active' as const,
    startDate: '2024-01-01',
    endDate: '2024-02-01',
    price: 150,
    usage: 8,
    limit: 12,
    nextBilling: '2024-02-01'
  },
  {
    id: 'SUB002',
    customerName: 'Mary Johnson',
    customerEmail: 'mary.j@email.com',
    plan: 'Basic Weekly',
    status: 'active' as const,
    startDate: '2024-01-05',
    endDate: '2024-01-12',
    price: 80,
    usage: 3,
    limit: 4,
    nextBilling: '2024-01-12'
  },
  {
    id: 'SUB003',
    customerName: 'Tom Wilson',
    customerEmail: 'tom.w@email.com',
    plan: 'Premium Yearly',
    status: 'active' as const,
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    price: 1500,
    usage: 45,
    limit: 144,
    nextBilling: '2025-01-01'
  },
  {
    id: 'SUB004',
    customerName: 'Sarah Davis',
    customerEmail: 'sarah.d@email.com',
    plan: 'Basic Monthly',
    status: 'expired' as const,
    startDate: '2023-12-01',
    endDate: '2024-01-01',
    price: 100,
    usage: 12,
    limit: 12,
    nextBilling: '2024-01-01'
  },
  {
    id: 'SUB005',
    customerName: 'Mike Brown',
    customerEmail: 'mike.b@email.com',
    plan: 'Premium Weekly',
    status: 'cancelled' as const,
    startDate: '2024-01-01',
    endDate: '2024-01-08',
    price: 120,
    usage: 2,
    limit: 4,
    nextBilling: '2024-01-08'
  }
];

// Mock data for payments
const payments = [
  {
    id: 'PAY001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    amount: 150,
    method: 'Credit Card',
    status: 'completed' as const,
    date: '2024-01-01',
    transactionId: 'TXN123456789',
    description: 'Premium Monthly Subscription'
  },
  {
    id: 'PAY002',
    customerName: 'Mary Johnson',
    customerEmail: 'mary.j@email.com',
    amount: 80,
    method: 'PayPal',
    status: 'completed' as const,
    date: '2024-01-05',
    transactionId: 'TXN987654321',
    description: 'Basic Weekly Subscription'
  },
  {
    id: 'PAY003',
    customerName: 'Tom Wilson',
    customerEmail: 'tom.w@email.com',
    amount: 1500,
    method: 'Bank Transfer',
    status: 'pending' as const,
    date: '2024-01-01',
    transactionId: 'TXN456789123',
    description: 'Premium Yearly Subscription'
  },
  {
    id: 'PAY004',
    customerName: 'Sarah Davis',
    customerEmail: 'sarah.d@email.com',
    amount: 100,
    method: 'Credit Card',
    status: 'failed' as const,
    date: '2023-12-01',
    transactionId: 'TXN789123456',
    description: 'Basic Monthly Subscription'
  },
  {
    id: 'PAY005',
    customerName: 'Mike Brown',
    customerEmail: 'mike.b@email.com',
    amount: 120,
    method: 'PayPal',
    status: 'refunded' as const,
    date: '2024-01-01',
    transactionId: 'TXN321654987',
    description: 'Premium Weekly Subscription'
  }
];

// Mock data for users
const users = [
  {
    id: 'USR001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    joinDate: '2024-01-01',
    status: 'active' as const,
    totalBookings: 15,
    totalSpent: 2250,
    lastActive: '2024-01-15'
  },
  {
    id: 'USR002',
    name: 'Mary Johnson',
    email: 'mary.j@email.com',
    phone: '+1-555-0124',
    joinDate: '2024-01-05',
    status: 'active' as const,
    totalBookings: 8,
    totalSpent: 640,
    lastActive: '2024-01-14'
  },
  {
    id: 'USR003',
    name: 'Tom Wilson',
    email: 'tom.w@email.com',
    phone: '+1-555-0125',
    joinDate: '2024-01-01',
    status: 'active' as const,
    totalBookings: 45,
    totalSpent: 6750,
    lastActive: '2024-01-15'
  },
  {
    id: 'USR004',
    name: 'Sarah Davis',
    email: 'sarah.d@email.com',
    phone: '+1-555-0126',
    joinDate: '2023-12-01',
    status: 'pending' as const,
    totalBookings: 12,
    totalSpent: 1200,
    lastActive: '2024-01-10'
  },
  {
    id: 'USR005',
    name: 'Mike Brown',
    email: 'mike.b@email.com',
    phone: '+1-555-0127',
    joinDate: '2024-01-01',
    status: 'suspended' as const,
    totalBookings: 2,
    totalSpent: 240,
    lastActive: '2024-01-08'
  }
];

// Mock data for all maids
const allMaids = [
  {
    id: 'MAID001',
    name: 'Maria Garcia',
    email: 'maria.g@email.com',
    phone: '+1-555-1001',
    address: '123 Worker St, City',
    experience: '3 years',
    specializations: ['Regular Cleaning', 'Deep Cleaning', 'Kitchen Cleaning'],
    rating: 4.8,
    status: 'active' as const,
    totalBookings: 156,
    joinDate: '2023-06-15'
  },
  {
    id: 'MAID002',
    name: 'Ana Rodriguez',
    email: 'ana.r@email.com',
    phone: '+1-555-1002',
    address: '456 Service Ave, City',
    experience: '5 years',
    specializations: ['Deep Cleaning', 'Full House Cleaning', 'Carpet Cleaning'],
    rating: 4.9,
    status: 'active' as const,
    totalBookings: 203,
    joinDate: '2023-03-20'
  },
  {
    id: 'MAID003',
    name: 'Sofia Martinez',
    email: 'sofia.m@email.com',
    phone: '+1-555-1003',
    address: '789 Clean Rd, City',
    experience: '2 years',
    specializations: ['Regular Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning'],
    rating: 4.6,
    status: 'active' as const,
    totalBookings: 89,
    joinDate: '2023-09-10'
  },
  {
    id: 'MAID004',
    name: 'Isabella Lopez',
    email: 'isabella.l@email.com',
    phone: '+1-555-1004',
    address: '321 Maid St, City',
    experience: '1 year',
    specializations: ['Regular Cleaning', 'Kitchen Cleaning'],
    rating: 4.3,
    status: 'pending' as const,
    totalBookings: 0,
    joinDate: '2024-01-10'
  },
  {
    id: 'MAID005',
    name: 'Carmen Torres',
    email: 'carmen.t@email.com',
    phone: '+1-555-1005',
    address: '654 Helper Ave, City',
    experience: '4 years',
    specializations: ['Deep Cleaning', 'Full House Cleaning', 'Carpet Cleaning', 'Bathroom Cleaning'],
    rating: 4.7,
    status: 'pending' as const,
    totalBookings: 0,
    joinDate: '2024-01-12'
  }
];

// Available maids (only active ones)
const availableMaids = allMaids.filter(maid => maid.status === 'active');

// Analytics data
const analyticsData = {
  totalBookings: 156,
  totalCustomers: 89,
  totalMaids: 5,
  totalRevenue: 23450,
  monthlyGrowth: 12.5,
  customerGrowth: 8.3,
  maidGrowth: 25.0,
  revenueGrowth: 15.7
};

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['bookings', 'subscriptions', 'payments', 'users', 'maids', 'analytics'].includes(hash)) {
      return hash;
    }
    return 'bookings';
  });

  // Sync tabs with URL hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['bookings', 'subscriptions', 'payments', 'users', 'maids', 'analytics'].includes(hash)) {
      setActiveTab(hash);
    } else if (!location.hash) {
      // Default to bookings tab if no hash is set
      setActiveTab('bookings');
    }
  }, [location.hash]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/admin#${value}`);
  };

  const handleAssignMaid = (bookingId: string, maidId: string) => {
    // Mock function - in real app, this would update the booking
    console.log(`Assigning maid ${maidId} to booking ${bookingId}`);
  };

  const handleAddMaid = (maidData: any) => {
    // Mock function - in real app, this would add a new maid
    console.log('Adding new maid:', maidData);
  };

  const handleVerifyMaid = (maidId: string) => {
    // Mock function - in real app, this would verify the maid
    console.log('Verifying maid:', maidId);
  };

  const handleVerifyUser = (userId: string) => {
    // Mock function - in real app, this would verify the user
    console.log('Verifying user:', userId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage bookings, customers, maids, and monitor platform performance
            </p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalBookings}</div>
              <p className="text-xs text-success flex items-center gap-1">
                ↗️ {analyticsData.monthlyGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalCustomers}</div>
              <p className="text-xs text-success flex items-center gap-1">
                ↗️ {analyticsData.customerGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Maids</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalMaids}</div>
              <p className="text-xs text-success flex items-center gap-1">
                ↗️ {analyticsData.maidGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{analyticsData.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-success flex items-center gap-1">
                ↗️ {analyticsData.revenueGrowth}% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="maids">Maids</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <AdminBookingsSection
              pendingBookings={pendingBookings}
              confirmedBookings={confirmedBookings}
              availableMaids={availableMaids}
              onAssignMaid={handleAssignMaid}
            />
          </TabsContent>

          <TabsContent value="subscriptions">
            <AdminSubscriptionsSection subscriptions={subscriptions} />
          </TabsContent>

          <TabsContent value="payments">
            <AdminPaymentsSection payments={payments} />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersSection users={users} onVerifyUser={handleVerifyUser} />
          </TabsContent>

          <TabsContent value="maids">
            <AdminMaidsSection
              allMaids={allMaids}
              onAddMaid={handleAddMaid}
              onVerifyMaid={handleVerifyMaid}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalyticsSection analyticsData={analyticsData} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 