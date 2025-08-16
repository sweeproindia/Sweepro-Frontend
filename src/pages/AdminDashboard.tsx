import { AdminAnalyticsSection } from '../components/dashboard/AdminAnalyticsSection';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
import { AdminBookingsSection } from '../components/dashboard/AdminBookingsSection';
import { AdminSubscriptionsSection } from '../components/dashboard/AdminSubscriptionsSection';
import { AdminPaymentsSection } from '../components/dashboard/AdminPaymentsSection';
import { AdminUsersSection } from '../components/dashboard/AdminUsersSection';
import { AdminMaidsSection } from '../components/dashboard/AdminMaidsSection';

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

  const [pendingBookings, setPendingBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [availableMaids, setAvailableMaids] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    totalBookings: 0,
    totalCustomers: 0,
    totalMaids: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    customerGrowth: 0,
    maidGrowth: 0,
    revenueGrowth: 0
  });

  useEffect(() => {
    fetch('https://sweep-pro-backend-testing.onrender.com/api/admin/pending-bookings')
      .then(res => res.json())
      .then(data => setPendingBookings(data))
      .catch(() => setPendingBookings([]));

    fetch('https://sweep-pro-backend-testing.onrender.com/api/bookings/')
      .then(res => res.json())
      .then(data => setConfirmedBookings(data))
      .catch(() => setConfirmedBookings([]));

    fetch('https://sweep-pro-backend-testing.onrender.com/api/admin/available-maids')
      .then(res => res.json())
      .then(data => setAvailableMaids(data))
      .catch(() => setAvailableMaids([]));

    fetch('https://sweep-pro-backend-testing.onrender.com/api/admin/active-customers')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setUsers([]));

    // Uncomment when endpoints are ready
    // fetch('https://sweep-pro-backend-testing.onrender.com/api/admin/subscriptions')
    //   .then(res => res.json())
    //   .then(data => setSubscriptions(data))
    //   .catch(() => setSubscriptions([]));

    // fetch('https://sweep-pro-backend-testing.onrender.com/api/admin/payments')
    //   .then(res => res.json())
    //   .then(data => setPayments(data))
    //   .catch(() => setPayments([]));
  }, []);
}
