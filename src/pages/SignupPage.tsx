import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { AuthService, RegisterData } from '@/services/authService';
import { Eye, EyeOff, Lock, Mail, Phone, Shield, Sparkles, User } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'MAID',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const selectedPlan = location.state?.selectedPlan || 'Standard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match. Please check and try again.',
        variant: 'destructive'
      });
      return;
    }
    setIsLoading(true);
    try {
      const registerData: RegisterData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        address: formData.address
      };

      const response = await AuthService.register(registerData);
      
      if (response.success) {
        toast({
          title: 'Account created successfully!',
          description: `Welcome to SweepPro, ${response.data?.user.name}!`,
        });
        
        // Navigate based on role
        switch (response.data?.user.role) {
          case 'ADMIN':
            navigate('/admin-dashboard');
            break;
          case 'MAID':
            navigate('/maid-dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.res || error.msg || 'Could not create account',
        variant: 'destructive'
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

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as 'CUSTOMER' | 'MAID'
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-400 to-white p-3 sm:p-4">
      <div className="w-full max-w-6xl bg-white/60 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden my-4">
        {/* Left: Signup Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-start p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto max-h-[calc(100vh-2rem)]">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 justify-center md:justify-start flex-shrink-0">
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg p-1.5 sm:p-2 shadow-lg">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-blue-900">SweepPro</span>
          </div>
          
          <Card className="shadow-none border-0 bg-transparent p-0">
            <CardHeader className="text-left pb-3 sm:pb-4 px-0 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl font-extrabold text-blue-900 mb-1">Create Your Account</CardTitle>
              <CardDescription className="text-blue-700/80 text-xs sm:text-sm font-medium">
                Join thousands of satisfied customers
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-blue-900/80 text-xs sm:text-sm">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-9 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm bg-white/40 border-white/40 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-blue-900/80 text-xs sm:text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-9 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm bg-white/40 border-white/40 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-blue-900/80 text-xs sm:text-sm">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-9 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm bg-white/40 border-white/40 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-blue-900/80 text-xs sm:text-sm">Account Type</Label>
                  <RadioGroup value={formData.role} onValueChange={handleRoleChange}>
                    <div className="flex items-center space-x-2 bg-white/40 rounded-lg p-2 sm:p-2.5 border border-white/40">
                      <RadioGroupItem value="CUSTOMER" id="customer" className="border-blue-400" />
                      <Label htmlFor="customer" className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer text-blue-900 text-xs sm:text-sm flex-1">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>Customer - I need cleaning services</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/40 rounded-lg p-2 sm:p-2.5 border border-white/40">
                      <RadioGroupItem value="MAID" id="maid" className="border-blue-400" />
                      <Label htmlFor="maid" className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer text-blue-900 text-xs sm:text-sm flex-1">
                        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>Maid - I provide cleaning services</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Address Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-blue-900/80 text-xs sm:text-sm">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Enter your full address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="h-9 sm:h-10 text-xs sm:text-sm bg-white/40 border-white/40 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50"
                  />
                  <p className="text-[10px] sm:text-xs text-blue-600/70">Please provide a complete address</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-blue-900/80 text-xs sm:text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-9 sm:pl-10 pr-9 sm:pr-10 h-9 sm:h-10 text-xs sm:text-sm bg-white/40 border-white/40 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-blue-400 hover:text-blue-700"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-blue-900/80 text-xs sm:text-sm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-9 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm bg-white/40 border-white/40 text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded border-blue-400 mt-0.5 sm:mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-[10px] sm:text-xs text-blue-900/70">
                    I agree to the{' '}
                    <a href="#" className="text-blue-500 hover:text-blue-700">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-500 hover:text-blue-700">
                      Privacy Policy
                    </a>
                  </span>
                </div>

                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-semibold h-9 sm:h-10 text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>

              <div className="mt-3 sm:mt-4 text-center">
                <p className="text-blue-900/70 text-xs sm:text-sm">
                  Already have an account?{' '}
                  <a href="/login" className="text-blue-500 hover:text-blue-700 font-medium">
                    Sign in
                  </a>
                </p>
              </div>

              {/* Social Signup */}
              <div className="mt-3 sm:mt-4">
                <div className="relative my-3 sm:my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-blue-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-transparent px-2 text-blue-400">Or sign up with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Button 
                    type="button"
                    className="bg-white/40 hover:bg-white/60 text-blue-900 hover:text-blue-700 border border-white/40 hover:border-white/60 h-8 sm:h-9 text-xs"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button 
                    type="button"
                    className="bg-white/40 hover:bg-white/60 text-blue-900 hover:text-blue-700 border border-white/40 hover:border-white/60 h-8 sm:h-9 text-xs"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Illustration/Info - Full Cover with Blend */}
        <div className="hidden md:flex w-1/2 relative overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2d3cf6] to-blue-500">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex items-center justify-center p-6 lg:p-10 w-full">
            <div className="text-white max-w-md">
              <h2 className="text-2xl lg:text-3xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                Join SweepPro and experience hassle-free cleaning!
              </h2>
              <p className="mb-6 lg:mb-8 text-blue-100 text-sm lg:text-base font-medium drop-shadow">
                Sign up to book trusted professionals, manage your appointments, and enjoy a sparkling home every day.
              </p>
              <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 backdrop-blur-sm bg-white/10">
                <div className="aspect-video bg-gradient-to-br from-blue-400/30 to-blue-600/30 flex items-center justify-center">
              <img src="public\assets\login-page.png" alt="Dashboard Preview" className="w-full h-auto object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}