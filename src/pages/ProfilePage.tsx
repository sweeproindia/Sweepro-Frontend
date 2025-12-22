import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MaidProfilePage } from './MaidProfilePage';
import { AdminProfilePage } from './AdminProfilePage';
import { CustomerProfilePage } from './CustomerProfilePage';

const ProfilePage: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user role from context or localStorage
    const role = user?.role || localStorage.getItem('userRole');
    setUserRole(role?.toUpperCase() || 'CUSTOMER');
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Route to appropriate profile page based on user role
  switch (userRole) {
    case 'MAID':
      return <MaidProfilePage />;
    case 'ADMIN':
      return <AdminProfilePage />;
    case 'CUSTOMER':
    default:
      return <CustomerProfilePage />;
  }
};

export default ProfilePage;
