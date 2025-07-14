import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  isAuthenticated?: boolean;
  onAuthAction?: () => void;
}

export const Navbar = ({ isAuthenticated = false, onAuthAction }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-hero rounded-lg p-2 group-hover:scale-105 transition-transform">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CleanEase</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#services" className="text-muted-foreground hover:text-primary transition-colors">
              Services
            </Link>
            <Link to="/#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link to="/#pricing" className="text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="default">Dashboard</Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/signup">
                  <Button className="btn-hero">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <Link 
              to="/#services" 
              className="block text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={toggleMenu}
            >
              Services
            </Link>
            <Link 
              to="/#how-it-works" 
              className="block text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={toggleMenu}
            >
              How It Works
            </Link>
            <Link 
              to="/#pricing" 
              className="block text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={toggleMenu}
            >
              Pricing
            </Link>
            
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={toggleMenu}>
                <Button variant="default" className="w-full">Dashboard</Button>
              </Link>
            ) : (
              <div className="space-y-2 pt-2">
                <Link to="/login" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/signup" onClick={toggleMenu}>
                  <Button className="btn-hero w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};