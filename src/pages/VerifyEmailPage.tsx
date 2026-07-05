// Force Vite HMR
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, HttpMethod, apiRequest } from '@/services/api';
import { Loader2, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || otp.length !== 6) return;

    setIsVerifying(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.AUTH.VERIFY_EMAIL_OTP, {
        method: HttpMethod.POST,
        body: { email, otp },
        requiresAuth: false
      });

      toast({ 
        title: 'Email verified!', 
        description: response.message || 'You can now sign in.',
        variant: 'default',
      });
      
      // Redirect to login after a short delay
      setTimeout(() => navigate('/login'), 1500);
      
    } catch (error: any) {
      toast({ 
        title: 'Verification failed', 
        description: error?.message || 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
      setOtp(""); // clear on fail
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || countdown > 0) return;
    
    setIsResending(true);
    try {
      await apiRequest(API_ENDPOINTS.AUTH.RESEND_VERIFICATION_OTP, {
        method: HttpMethod.POST,
        body: { email },
        requiresAuth: false
      });
      
      toast({ 
        title: 'OTP Sent', 
        description: 'A new verification code has been sent to your email.',
      });
      setCountdown(60); // 60 second cooldown
    } catch (error: any) {
      toast({ 
        title: 'Failed to resend', 
        description: error?.message || 'Could not resend OTP. Please try again later.',
        variant: 'destructive',
      });
      if (error?.message?.includes('wait 60 seconds')) {
        setCountdown(60);
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <img src="/assets/logo.png" alt="Sweepro Logo" className="h-20 w-auto" />
        </div>

        <Card className="border-none shadow-xl bg-white/90 backdrop-blur">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 shadow-sm">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
              Verify your email
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              We've sent a 6-digit verification code to<br/>
              <span className="font-semibold text-gray-900">{email || 'your email address'}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              
              {!emailParam && (
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your email"
                    disabled={isVerifying}
                  />
                </div>
              )}

              <div className="flex flex-col items-center justify-center space-y-4">
                <InputOTP 
                  maxLength={6} 
                  value={otp} 
                  onChange={(val) => {
                    setOtp(val);
                  }}
                  disabled={isVerifying || !email}
                  autoFocus
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-12 h-14 text-xl font-semibold rounded-md border-gray-300 bg-white" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-xl font-semibold rounded-md border-gray-300 bg-white" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-xl font-semibold rounded-md border-gray-300 bg-white" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-xl font-semibold rounded-md border-gray-300 bg-white" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-xl font-semibold rounded-md border-gray-300 bg-white" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-xl font-semibold rounded-md border-gray-300 bg-white" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button 
                type="submit" 
                className="w-full py-6 text-base font-medium shadow-md transition-all hover:shadow-lg bg-blue-600 hover:bg-blue-700" 
                disabled={isVerifying || otp.length !== 6 || !email}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
              
              <div className="flex flex-col items-center space-y-2 pt-2">
                <div className="text-sm text-gray-600">
                  Didn't receive the code?
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResend}
                  disabled={isResending || countdown > 0 || !email}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {isResending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                  ) : countdown > 0 ? (
                    `Resend code in ${countdown}s`
                  ) : (
                    'Click to resend'
                  )}
                </Button>
              </div>
              
              <div className="text-center text-sm pt-4 border-t">
                <Link to="/login" className="font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  &larr; Back to login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}