import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, HttpMethod, apiRequest } from '@/services/api';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => String(searchParams.get('token') || ''), [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({
        title: 'Invalid reset link',
        description: 'Missing token. Please request a new password reset link.',
        variant: 'destructive'
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please confirm your new password correctly.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        method: HttpMethod.POST,
        body: {
          token,
          password,
          confirmPassword
        },
        requiresAuth: false
      });

      toast({
        title: 'Password updated',
        description: response.message || 'Password reset successful. Please log in with your new password.'
      });

      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Reset failed',
        description: error?.message || 'Unable to reset password. Please try again.',
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
            <CardTitle className="text-2xl font-bold text-gray-900">Reset password</CardTitle>
            <CardDescription className="text-gray-600">
              Enter a new password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!token ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  This reset link is invalid or missing a token.
                </div>
                <Button asChild className="w-full py-6 text-base font-medium">
                  <Link to="/forgot-password">Request a new link</Link>
                </Button>
                <div className="text-center text-sm text-gray-600">
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                    Back to login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-12 py-6"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm new password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-12 py-6"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-base font-medium">
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Updating...
                    </span>
                  ) : (
                    'Update password'
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
