import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function UserDashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      try {
        // Fetch user profile
        const userRes = await fetch('https://sweep-pro-backend-testing.onrender.com/api/auth/me', {
          credentials: 'include',
        });
        const userData = await userRes.json();
        setUserInfo(userData);

        // Fetch user bookings
        const bookingsRes = await fetch('https://sweep-pro-backend-testing.onrender.com/api/bookings/my-bookings', {
          credentials: 'include',
        });
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);

        // Fetch user subscriptions (dummy endpoint)
        // const subsRes = await fetch('https://sweep-pro-backend-testing.onrender.com/api/subscriptions/my', { credentials: 'include' });
        // const subsData = await subsRes.json();
        // setSubscriptions(subsData);

        // Fetch user payments (dummy endpoint)
        // const payRes = await fetch('https://sweep-pro-backend-testing.onrender.com/api/payments/my', { credentials: 'include' });
        // const payData = await payRes.json();
        // setPayments(payData);
      } catch (err) {
        setUserInfo(null);
        setBookings([]);
        setSubscriptions([]);
        setPayments([]);
      }
      setLoading(false);
    }
    fetchUserData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Account details and status</CardDescription>
          </CardHeader>
          <CardContent>
            {userInfo ? (
              <div className="space-y-2">
                <div><strong>Name:</strong> {userInfo.name}</div>
                <div><strong>Email:</strong> {userInfo.email}</div>
                <div><strong>Phone:</strong> {userInfo.phone}</div>
                <div><strong>Role:</strong> <Badge>{userInfo.role}</Badge></div>
                <div><strong>Address:</strong> {userInfo.address}</div>
              </div>
            ) : (
              <div className="text-muted-foreground">No user info found.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>All your bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <div key={booking.id} className="border rounded-lg p-4 flex flex-col gap-2">
                    <div><strong>Service:</strong> {booking.service}</div>
                    <div><strong>Date:</strong> {booking.date}</div>
                    <div><strong>Time:</strong> {booking.time}</div>
                    <div><strong>Status:</strong> <Badge>{booking.status}</Badge></div>
                    <div><strong>Address:</strong> {booking.address}</div>
                    <div><strong>Price:</strong> ₹{booking.price}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No bookings found.</div>
            )}
          </CardContent>
        </Card>

        {/* Uncomment and implement when endpoints are available */}
        {/* <Card>
          <CardHeader>
            <CardTitle>My Subscriptions</CardTitle>
            <CardDescription>Active and past subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <div>...subscription info...</div>
            ) : (
              <div className="text-muted-foreground">No subscriptions found.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Payments</CardTitle>
            <CardDescription>Payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div>...payment info...</div>
            ) : (
              <div className="text-muted-foreground">No payments found.</div>
            )}
          </CardContent>
        </Card> */}
      </div>
    </DashboardLayout>
  );
}
