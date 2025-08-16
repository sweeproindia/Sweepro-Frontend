import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, Mail, Shield, Sparkles, User } from 'lucide-react';
import { useState } from 'react';

export default function LoginForm({ onSuccess, onClose }: { onSuccess?: () => void; onClose?: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onSuccess) onSuccess();
      else alert(`Login successful! Welcome back as ${userType}.`);
      if (onClose) onClose();
    }, 1000);
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
        <CardTitle className="text-3xl font-extrabold text-blue-900 mb-1 tracking-tight drop-shadow">Welcome Back</CardTitle>
        <CardDescription className="text-blue-700/80 text-base font-medium mb-2">Sign in to your account to manage your cleaning services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-7 px-2 md:px-6 pb-6">
        {/* User Type Selection */}
        <div>
          <Label className="text-sm font-semibold mb-3 block text-blue-900/90">Login as</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={userType === 'user' ? 'default' : 'outline'}
              className={`flex flex-col items-center py-3 h-auto rounded-xl transition-all duration-200 ${
                userType === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-md hover:shadow-xl scale-105' 
                  : 'bg-white/60 text-blue-900/70 border-blue-200 hover:bg-blue-50 hover:text-blue-900'
              }`}
              onClick={() => setUserType('user')}
            >
              <User className="h-5 w-5 mb-1" />
              <span className="text-xs font-semibold">User</span>
            </Button>
            <Button
              type="button"
              variant={userType === 'maid' ? 'default' : 'outline'}
              className={`flex flex-col items-center py-3 h-auto rounded-xl transition-all duration-200 ${
                userType === 'maid' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-md hover:shadow-xl scale-105' 
                  : 'bg-white/60 text-blue-900/70 border-blue-200 hover:bg-blue-50 hover:text-blue-900'
              }`}
              onClick={() => setUserType('maid')}
            >
              <Shield className="h-5 w-5 mb-1" />
              <span className="text-xs font-semibold">Maid</span>
            </Button>
          </div>
        </div>

        {/* Email Input */}
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

        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-blue-900/90 font-semibold">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
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

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 text-blue-900/70 cursor-pointer">
            <input type="checkbox" className="rounded border-blue-400 bg-white/40 text-blue-500" />
            <span>Remember me</span>
          </label>
          <a href="#" className="text-blue-500 hover:text-blue-700 font-semibold transition-colors duration-200">
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <Button 
          className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 text-lg tracking-wide"
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </Button>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-blue-900/80 text-base font-medium">
            Don't have an account?{' '}
            <button type="button" className="text-blue-500 hover:text-blue-700 font-bold transition-colors duration-200 underline underline-offset-2" onClick={onClose}>
              Sign up for free
            </button>
          </p>
        </div>

        {/* Social Login */}
        <div>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-transparent px-3 text-blue-400 font-semibold">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button"
              className="bg-white/80 hover:bg-blue-50 text-blue-900 hover:text-blue-700 border border-blue-200 hover:border-blue-400 transition-all duration-200 rounded-xl font-semibold"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button 
              type="button"
              className="bg-white/80 hover:bg-blue-50 text-blue-900 hover:text-blue-700 border border-blue-200 hover:border-blue-400 transition-all duration-200 rounded-xl font-semibold"
            >
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