import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, Mail, Phone, Sparkles, User } from 'lucide-react';
import { useState } from 'react';
import { AuthService } from '@/services/authService';
import { validateEmail, validatePassword, scrollToFirstError } from '@/utils/validation';

export default function SignupForm({ onSuccess, onClose }: { onSuccess?: () => void; onClose?: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nextErrors: Record<string, string> = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name) nextErrors.name = 'Full name is required.';
    else if (name.length < 2) nextErrors.name = 'Name must be at least 2 characters.';
    else if (!/^[a-zA-Z\s]+$/.test(name)) nextErrors.name = 'Name can only contain letters and spaces.';

    const emailErr = validateEmail(email);
    if (emailErr) nextErrors.email = emailErr;

    if (!phone) nextErrors.phone = 'Phone number is required.';
    else if (!/^[6-9]\d{9}$/.test(phone)) nextErrors.phone = 'Enter a valid 10-digit Indian phone number starting with 6-9.';

    const passwordError = validatePassword(formData.password);
    if (passwordError) nextErrors.password = passwordError;

    if (!formData.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';

    if (!formData.agreeTerms) nextErrors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy.';

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError('Please fix the highlighted fields.');
      setTimeout(() => scrollToFirstError(nextErrors), 50);
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthService.register({
        name,
        email,
        phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'CUSTOMER',
        address: '',
        serviceArea: '',
        pincode: ''
      });
      
      if (response.success) {
        toast({
          title: "Account created successfully!",
          description: "Please check your email for verification OTP.",
        });
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        toast({
          title: "Registration failed",
          description: response.message || "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    setFormError(null);
  };

  return (
    <Card className="shadow-2xl border-2 border-blue-200/60 bg-white/40 backdrop-blur-lg rounded-2xl hover:shadow-3xl transition-all duration-300">
      <CardHeader className="text-center pb-4 flex flex-col items-center">
        <div className="bg-gradient-to-tr from-blue-400 via-blue-500 to-blue-700 p-3 rounded-full shadow-lg mb-2 animate-pulse">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-extrabold text-blue-900 mb-1 tracking-tight drop-shadow">Create Your Account</CardTitle>
        <CardDescription className="text-blue-700/80 text-base font-medium mb-2">Join thousands of satisfied customers and get started with Sweepro</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit} className="space-y-7 px-2 md:px-6 pb-6">
          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-blue-900/90 font-semibold">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                className={`pl-10 bg-white/70 border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-300/40 rounded-xl transition-colors duration-200 ${fieldErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                required
              />
            </div>
            {fieldErrors.name && (
              <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-900/90 font-semibold">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className={`pl-10 bg-white/70 border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-300/40 rounded-xl transition-colors duration-200 ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                required
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-blue-900/90 font-semibold">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength={10}
                className={`pl-10 bg-white/70 border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-300/40 rounded-xl transition-colors duration-200 ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                required
              />
            </div>
            {fieldErrors.phone && (
              <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-900/90 font-semibold">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                className={`pl-10 pr-10 bg-white/70 border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-300/40 rounded-xl transition-colors duration-200 ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-blue-400 hover:text-blue-700 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-blue-900/90 font-semibold">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`pl-10 bg-white/70 border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-300/40 rounded-xl transition-colors duration-200 ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                required
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                className="rounded border-blue-400 mt-1"
                required
              />
              <span className="text-sm text-blue-900/70">
                I agree to the{' '}
                <a href="/terms" className="text-blue-500 hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</a>
              </span>
            </div>
            {fieldErrors.agreeTerms && (
              <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.agreeTerms}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 text-lg tracking-wide" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-blue-900/80 text-base font-medium">
            Already have an account?{' '}
            <button type="button" className="text-blue-500 hover:text-blue-700 font-bold transition-colors duration-200 underline underline-offset-2" onClick={onClose}>
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}