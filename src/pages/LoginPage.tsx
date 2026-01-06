import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Sparkles, User, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAuthTokenType } from '@/services/api';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    refreshUser,
    login,
    setAuthenticatedUser,
    user: currentUser,
    isAuthenticated,
    authInitialized,
    isLoading: isAuthLoading
  } = useUser();

  const navigateAfterAuth = async (user: any) => {
    await refreshUser();

    const tokenType = getAuthTokenType();
    const shouldEnforceProfileCompletion = tokenType === 'firebase' || Boolean(user?.firebase_uid);

    if (shouldEnforceProfileCompletion && !user.profile_completed) {
      navigate('/complete-profile');
      return;
    }

    switch (user.role) {
      case 'ADMIN':
        navigate('/admin-dashboard');
        break;
      case 'MAID':
        navigate('/maid-dashboard');
        break;
      case 'CUSTOMER':
      default:
        navigate('/dashboard');
    }
  };

  useEffect(() => {
    if (!authInitialized || isAuthLoading) return;
    if (!isAuthenticated || !currentUser) return;

    navigateAfterAuth(currentUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authInitialized, isAuthLoading, isAuthenticated, currentUser]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const response = await AuthService.signInWithGoogle();
      
      if (response.success && response.data?.user) {
        const user = response.data.user;

        // Mark as authenticated immediately so route guards / refreshUser can work.
        setAuthenticatedUser(user);

        toast({
          title: 'Login successful!',
          description: `Welcome to Sweep-Pro, ${user.name}!`,
        });

        await navigateAfterAuth(user);
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Google sign-in failed. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Sign-in failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);

    try {
      const loggedInUser = await login(email.trim(), password);

      toast({
        title: 'Login successful!',
        description: `Welcome back, ${loggedInUser.name}!`,
      });

      await navigateAfterAuth(loggedInUser);
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error?.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Left Column - Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img src="/assets/logo.png" alt="Sweepro Logo" className="h-24 w-auto" />
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome to Sweep-Pro</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in with email/password or Google
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleEmailLogin} className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
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
                      autoComplete="current-password"
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

                <div className="text-right text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" disabled={isEmailLoading || isLoading} className="w-full py-6 text-base font-medium">
                  {isEmailLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-6 text-base font-medium bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </span>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </div>

              <div className="text-center text-sm text-gray-600">
                New here?{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
                  Create an account
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Illustration/Info */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 max-w-lg mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl mb-6">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Welcome to Sweep-Pro!
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Your trusted platform for professional cleaning services. Sign in with Google to get started.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Authentication</h3>
                <p className="text-blue-100">Your account is protected with Google's secure authentication</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Quick Setup</h3>
                <p className="text-blue-100">Complete your profile in seconds and start using our services</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Easy Access</h3>
                <p className="text-blue-100">One-click sign-in with your Google account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
