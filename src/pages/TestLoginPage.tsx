import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { AuthService } from '@/services/authService';
import { Loader2, User, Shield, Wrench } from 'lucide-react';

const TestLoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const { toast } = useToast();
  const { login } = useUser();
  const navigate = useNavigate();

  const testAccounts = [
    {
      role: 'CUSTOMER',
      email: 'customer@test.com',
      password: 'password123',
      name: 'Test Customer',
      icon: User,
      description: 'Test customer account with active subscription'
    },
    {
      role: 'ADMIN',
      email: 'admin@test.com',
      password: 'password123',
      name: 'Test Admin',
      icon: Shield,
      description: 'Admin account with full system access'
    },
    {
      role: 'MAID',
      email: 'maid@test.com',
      password: 'password123',
      name: 'Test Homecare Partner',
      icon: Wrench,
      description: 'Homecare Partner account for service assignments'
    }
  ];

  const handleTestLogin = async (email: string, password: string, role: string) => {
    setLoading(true);
    try {
      // Use the UserContext login function which handles everything
      const user = await login(email, password);
      
      toast({
        title: 'Login Successful',
        description: `Logged in as ${role.toLowerCase()}`,
      });

      // Redirect based on role
      switch (role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'MAID':
          navigate('/maid');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Test login error:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Failed to login with test account',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = async () => {
    if (!customEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Use the UserContext login function
      const user = await login(customEmail, 'password123');
      
      toast({
        title: 'Login Successful',
        description: `Logged in as ${customEmail}`,
      });

      // Redirect based on user role
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'MAID':
          navigate('/maid');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Custom login error:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Failed to login. Check if the account exists.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Test Login Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Quick access to test accounts for development and testing
          </p>
        </div>

        {/* Test Accounts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testAccounts.map((account) => {
            const IconComponent = account.icon;
            return (
              <Card key={account.role} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                  <CardDescription>{account.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <p><strong>Email:</strong> {account.email}</p>
                    <p><strong>Password:</strong> {account.password}</p>
                    <p><strong>Role:</strong> {account.role}</p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleTestLogin(account.email, account.password, account.role)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <IconComponent className="h-4 w-4 mr-2" />
                    )}
                    Login as {account.role}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Custom Login */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Login</CardTitle>
            <CardDescription>
              Login with any existing email (uses default password: password123)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="customEmail">Email Address</Label>
                <Input
                  id="customEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomLogin()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCustomLogin} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('/login')}>
            Back to Regular Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestLoginPage;
