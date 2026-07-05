import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, Mail, Phone, Sparkles, User } from 'lucide-react';
import { useState } from 'react';
import { AuthService } from '@/services/authService';

export default function SignupForm({ onSuccess, onClose }: { onSuccess?: () => void; onClose?: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please check and try again.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await AuthService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'CUSTOMER',
        address: '',
        serviceArea: '',
        pincode: ''
      });
      
      if (response.success) {
        toast({
          title: "Account created successfully!)",
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
        <form onSubmit={handleSubmit} className="space-y-7 px-2 md:px-6 pb-6">
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
                className="pl-10 bg-white/70 border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-300/40 rounded-xl transition-colors duration-200"
                required
              />
            </div>
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
                className="pl-10 bg-white/70 border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-300/40 rounded-xl transition-colors duration-200"
                required
              />
            </div>
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
                className="pl-10 bg-white/70 border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-300/40 rounded-xl transition-colors duration-200"
                required
              />
            </div>
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
                className="pl-10 pr-10 bg-white/70 border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-300/40 rounded-xl transition-colors duration-200"
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
                className="pl-10 bg-white/70 border-blue-200 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-300/40 rounded-xl transition-colors duration-200"
                required
              />
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <input type="checkbox" className="rounded border-blue-400 mt-1" required />
            <span className="text-sm text-blue-900/70">
              I agree to the{' '}
              <a href="/terms" className="text-blue-500 hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</a>
            </span>
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
        {/* Social Signup */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-blue-400 font-semibold">Or sign up with</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full rounded-xl font-semibold">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full rounded-xl font-semibold">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}