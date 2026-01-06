import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, HttpMethod, apiRequest } from '@/services/api';
import { Loader2, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiRequest(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: HttpMethod.POST,
        body: { email: email.trim() },
        requiresAuth: false
      });

      toast({
        title: 'Check your email',
        description: response.message || 'If an account exists for that email, a reset link has been sent.'
      });

      setEmail('');
    } catch (error: any) {
      toast({
        title: 'Request failed',
        description: error?.message || 'Unable to request password reset. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <img src="/assets/logo.png" alt="Sweepro Logo" className="h-20 w-auto" />
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Forgot password</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your email and we’ll send you a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 py-6"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-base font-medium">
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Sending...
                  </span>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Remembered your password?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
