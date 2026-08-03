import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OtpInput } from '@/components/OtpInput';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, HttpMethod, apiRequest } from '@/services/api';
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

type VerifyState = 'idle' | 'verifying' | 'success' | 'error';

export default function ResetPasswordOtpPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [state, setState] = useState<VerifyState>('idle');
  const [message, setMessage] = useState('Enter the 6-digit code sent to your email');
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const { toast } = useToast();

  const handleOtpComplete = async (otpValue: string) => {
    setOtp(otpValue);
    setState('verifying');
    setMessage('Verifying your code...');

    try {
      const response = await apiRequest(API_ENDPOINTS.AUTH.VERIFY_RESET_OTP, {
        method: HttpMethod.POST,
        body: { email, otp: otpValue },
        requiresAuth: false
      });

      setState('success');
      setMessage(response.message || 'OTP verified successfully. Please set your new password.');
      setVerifiedToken((response as any).token);
      toast({ title: 'Code verified', description: 'Please set your new password.' });
    } catch (error: any) {
      setState('error');
      setMessage(error?.message || 'Invalid or expired code. Please try again.');
      toast({ 
        title: 'Verification failed', 
        description: error?.message || 'Invalid or expired code',
        variant: 'destructive'
      });
    }
  };

  const handleResend = async () => {
    try {
      await apiRequest(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: HttpMethod.POST,
        body: { email },
        requiresAuth: false
      });
      toast({ title: 'Code resent', description: 'A new reset code has been sent to your email.' });
      setState('verifying');
      setMessage('Enter the new 6-digit code sent to your email');
      setOtp('');
    } catch (error: any) {
      toast({ 
        title: 'Failed to resend', 
        description: error?.message || 'Please try again later',
        variant: 'destructive'
      });
    }
  };

  const isSuccess = state === 'success';
  const isVerifying = state === 'verifying';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <img src="/assets/logo.png" alt="Sweepro Logo" className="h-20 w-auto" />
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white">
              {isVerifying ? (
                <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              ) : isSuccess ? (
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              ) : (
                <XCircle className="h-7 w-7 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isVerifying ? 'Reset your password' : isSuccess ? 'Code verified' : 'Verification failed'}
            </CardTitle>
            <CardDescription className="text-gray-600">{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isSuccess ? (
              <>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Enter the 6-digit code sent to:
                    </p>
                    <p className="font-medium text-gray-900">{email}</p>
                  </div>
                  <OtpInput
                    length={6}
                    onComplete={handleOtpComplete}
                    disabled={isVerifying}
                  />
                </div>
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={handleResend}
                    disabled={isVerifying}
                    className="text-sm"
                  >
                    Resend code
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-gray-600">
                  Your code has been verified. You can now set your new password.
                </p>
                {verifiedToken && (
                  <Button asChild className="w-full py-6 text-base font-medium">
                    <Link to={`/reset-password?token=${verifiedToken}`}>
                      Continue to set new password
                    </Link>
                  </Button>
                )}
              </div>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">
                Back to login
              </Link>
            </Button>
            <div className="text-center">
              <Button variant="ghost" asChild className="text-sm">
                <Link to="/forgot-password" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Request new code
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
