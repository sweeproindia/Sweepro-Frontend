import { TermsContent } from "@/components/legal/TermsContent";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState<"customer" | "worker">("customer");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "customer" || typeParam === "worker") {
      setUserType(typeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header - Logo Only with Scroll Hide */}
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] border-b border-gray-100 bg-white/95 backdrop-blur-sm transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-20">
            <Link to="/" className="flex items-center">
              <img
                src="/assets/logo.png"
                alt="Sweepro Logo"
                className="h-16 w-auto object-contain"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-8 sm:px-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Terms &amp; Conditions</h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Please review the terms applicable to your role
                  </p>
                </div>
                
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setUserType("customer")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      userType === "customer"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => setUserType("worker")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      userType === "worker"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Home Care Partner
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-10">
              <TermsContent userType={userType} />
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            These Terms are provided for general operational clarity for the Sweepro platform and services.
          </div>
        </div>
      </main>
    </div>
  );
}
