import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Eye, EyeOff, Loader2, Lock, Mail, MapPin, Shield, Sparkles, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAuthTokenType } from '@/services/api';
import { motion } from 'framer-motion';

// Predefined addresses for displaying available communities
const SERVICE_ADDRESSES = [
  { id: 1, name: 'Aparna CyberLife', area: 'Nallagandla', pincode: '500019' },
  { id: 2, name: 'Aparna HillPark Avenue', area: 'Chandanagar', pincode: '500050' },
  { id: 3, name: 'Aparna Kanopy Tulip', area: 'Kompally', pincode: '500100' },
  { id: 4, name: 'Aparna Sarovar Grande', area: 'Nallagandla', pincode: '500019' },
  { id: 5, name: 'Aparna Serene Park', area: 'Kondapur', pincode: '500084' },
  { id: 6, name: 'Bollineni Bion', area: 'Kothaguda', pincode: '500084' },
  { id: 7, name: 'Brigade Citadel', area: 'Moti Nagar', pincode: '500018' },
  { id: 8, name: 'Cybercity Oriana', area: 'Moosapet', pincode: '500018' },
  { id: 9, name: 'Fortune Green Homes Sapphire', area: 'Bachupally', pincode: '500090' },
  { id: 10, name: 'Fortune Sky Villas', area: 'Kokapet', pincode: '500075' },
  { id: 11, name: 'Godrej Madison Avenue', area: 'Kokapet', pincode: '500075' },
  { id: 12, name: 'L&T Serene County', area: 'Gachibowli', pincode: '500032' },
  { id: 13, name: 'Lanco Hills Apartments', area: 'Manikonda', pincode: '500089' },
  { id: 14, name: 'Lodha Bellezza', area: 'Kukatpally', pincode: '500072' },
  { id: 15, name: 'Malaysian Township', area: 'Kukatpally', pincode: '500072' },
  { id: 16, name: 'My Home Abhra', area: 'Madhapur', pincode: '500081' },
  { id: 17, name: 'My Home Apas', area: 'Kokapet', pincode: '500075' },
  { id: 18, name: 'My Home Avali', area: 'Gopanpally', pincode: '500075' },
  { id: 19, name: 'My Home Bhooja', area: 'Hitech City', pincode: '500081' },
  { id: 20, name: 'My Home Grava', area: 'Kokapet', pincode: '500075' },
  { id: 21, name: 'My Home Krishe', area: 'Gachibowli', pincode: '500032' },
  { id: 22, name: 'My Home Mangala', area: 'Kondapur', pincode: '500084' },
  { id: 23, name: 'My Home Nishada', area: 'Kokapet', pincode: '500075' },
  { id: 24, name: 'My Home Raka', area: 'Madinaguda', pincode: '500049' },
  { id: 25, name: 'My Home Sayuk', area: 'Tellapur', pincode: '500019' },
  { id: 26, name: 'My Home Tridasa', area: 'Tellapur', pincode: '500019' },
  { id: 27, name: 'My Home Vipina', area: 'Tellapur', pincode: '500019' },
  { id: 28, name: 'Prestige Beverly Hills', area: 'Kokapet', pincode: '500075' },
  { id: 29, name: 'Prestige High Fields', area: 'Gachibowli', pincode: '500032' },
  { id: 30, name: 'Prestige Ivy League', area: 'Hitech City', pincode: '500081' },
  { id: 31, name: 'Prestige Rainbow Waters', area: 'Gachibowli', pincode: '500032' },
  { id: 32, name: 'Rainbow Vistas Rock Garden', area: 'Moosapet', pincode: '500018' },
  { id: 33, name: 'Rajapushpa Atria', area: 'Kokapet', pincode: '500075' },
  { id: 34, name: 'Rajapushpa Provincia', area: 'Narsingi', pincode: '500075' },
  { id: 35, name: 'Ramky One Astra', area: 'Kokapet', pincode: '500075' },
  { id: 36, name: 'Ramky One Harmony', area: 'Pragathi Nagar', pincode: '500090' },
  { id: 37, name: 'SMR Vinay Iconia', area: 'Kondapur', pincode: '500084' },
  { id: 38, name: 'Vasavi Atlantis', area: 'Narsingi', pincode: '500075' },
  { id: 39, name: 'Vasavi Skyla', area: 'Hitech City', pincode: '500081' },
];

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const liveArea = 'Gachibowli';
  const comingSoonAreas = ['Kondapur', 'Hitech City', 'Kokapet', 'Madhapur', 'Manikonda', 'Narsingi'];
  const liveComplexes = SERVICE_ADDRESSES.filter((a) => a.area === liveArea);
  const liveComplexesToShow = liveComplexes.slice(0, 4);
  const liveComplexesExtraCount = Math.max(0, liveComplexes.length - liveComplexesToShow.length);

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

  // F4 FIX: Prevents re-entrant navigation that caused the infinite /auth/me loop.
  // The old code had navigate After Auth (which calls refreshUser) fired from a useEffect
  // that depends on currentUser. refreshUser updates currentUser → useEffect re-fires
  // → navigateAfterAuth again → infinite loop. This flag breaks the cycle.
  const [hasNavigated, setHasNavigated] = useState(false);

  /**
   * Pure navigation helper — picks the correct dashboard route based on user role.
   * Does NOT call refreshUser() so it is safe to use inside useEffect without
   * triggering state changes that would re-fire the effect.
   */
  const navigateByRole = (user: any) => {
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

  /**
   * Used by explicit login/signup handlers. Refreshes user data from
   * the server then navigates. The hasNavigated guard ensures this
   * only runs once even if state changes re-trigger the useEffect.
   */
  const navigateAfterAuth = async (user: any) => {
    if (hasNavigated) return;
    setHasNavigated(true);

    try {
      await refreshUser();
    } catch {
      // refreshUser failure is non-fatal; we still have the user from the login response
    }

    navigateByRole(user);
  };

  // If already authenticated on mount (e.g. page refresh while logged in),
  // navigate away immediately. Uses navigateByRole (not navigateAfterAuth)
  // to avoid the refreshUser → state update → useEffect infinite loop.
  useEffect(() => {
    if (!authInitialized || isAuthLoading) return;
    if (!isAuthenticated || !currentUser) return;
    if (hasNavigated) return;

    setHasNavigated(true);
    navigateByRole(currentUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authInitialized, isAuthLoading, isAuthenticated, currentUser, hasNavigated]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const response = await AuthService.signInWithGoogle('login');

      if (response.success && response.data?.user) {
        const user = response.data.user;

        // Mark as authenticated immediately so route guards / refreshUser can work.
        setAuthenticatedUser(user);

        toast({
          title: 'Login successful!',
          description: `Welcome to Sweepro, ${user.name}!`,
        });

        await navigateAfterAuth(user);
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      await AuthService.logout();

      // If user doesn't have an account, redirect to signup page
      if (error?.response?.isNewUser || error?.statusCode === 404) {
        toast({
          title: 'Account not found',
          description: 'No account exists with this Google email. Redirecting you to sign up.',
          variant: 'destructive',
        });
        navigate('/signup');
        return;
      }

      let errorMessage = 'Google sign-in failed. Please try again.';
      if (error?.response?.error) {
        errorMessage = error.response.error;
      } else if (error.message) {
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
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img src="/assets/logo.png" alt="Sweepro Logo" className="h-24 w-auto" />
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome to Sweepro</CardTitle>
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

                <Button
                  type="submit"
                  disabled={isEmailLoading || isLoading}
                  className="w-full py-6 text-base font-medium bg-[#1800ad] text-white hover:bg-[#ca0013]"
                >
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
                <div className="mb-2 inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                  <MapPin className="h-3.5 w-3.5 text-[#1800ad]" />
                  <span>Now serving {liveArea} • More areas coming soon</span>
                </div>
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
      <div className="hidden lg:flex flex-1 fixed right-0 top-0 h-screen w-1/2 bg-[#1800ad] text-white overflow-hidden">
        {/* Modern Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#ca0013] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#eeebe3] rounded-full blur-[100px] opacity-10"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        </div>

        <div className="relative z-10 flex flex-col w-full h-full items-center justify-center px-16">
          <div className="w-full max-w-lg">
            {/* Value Proposition Header */}
            <div className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
              >
                <Sparkles className="h-4 w-4 text-[#eeebe3]" />
                <span className="text-sm font-semibold tracking-wide uppercase">Premium Home Care</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl font-extrabold mb-6 leading-tight"
              >
                Why choose <span className="text-[#eeebe3]">Sweepro?</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-[#eeebe3]/80 leading-relaxed"
              >
                Join the elite community of homeowners who trust us for impeccable hygiene and professional care.
              </motion.p>
            </div>

            {/* Service Area Focus */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative mb-12 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ca0013] shadow-lg shadow-[#ca0013]/40 animate-bounce">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2">Exclusively Live In</h3>
              <p className="text-[#eeebe3] text-4xl font-black mb-6 tracking-tight">{liveArea}</p>

              <div className="space-y-3">
                <p className="text-sm font-medium text-[#eeebe3]/60 uppercase tracking-widest">Available Communities</p>
                <div className="grid grid-cols-2 gap-3">
                  {liveComplexesToShow.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="flex items-center gap-2 bg-white/5 py-2 px-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-[#ca0013]" />
                      <span className="text-sm font-medium truncate">{c.name}</span>
                    </motion.div>
                  ))}
                  {liveComplexesExtraCount > 0 && (
                    <div className="flex items-center gap-2 bg-white/5 py-2 px-3 rounded-lg border border-white/5 italic text-sm text-[#eeebe3]/60">
                      + {liveComplexesExtraCount} others
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Expansion Roadmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-[#eeebe3]/60" />
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#eeebe3]/60">Expansion Roadmap</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {comingSoonAreas.map((area, index) => (
                  <span
                    key={area}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-[#eeebe3]/80 hover:bg-white/10 hover:text-white transition-all cursor-default"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
