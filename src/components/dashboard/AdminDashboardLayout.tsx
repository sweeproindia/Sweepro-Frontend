import { DashboardNavbar } from './DashboardNavbar';
import { AdminDashboardSidebar } from './AdminDashboardSidebar';
import { useState, useEffect, useCallback } from 'react';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export const AdminDashboardLayout = ({ children }: AdminDashboardLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on route change or escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsMobileSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen, handleEscape]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Top Navigation */}
      <DashboardNavbar 
        userType="admin"
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main content area with sidebar and page content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop (always visible on desktop) */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <AdminDashboardSidebar />
        </div>
        
        {/* Mobile / Tablet Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden animate-in slide-in-from-left duration-200">
              <AdminDashboardSidebar forceOpen setOpen={setIsMobileSidebarOpen} />
            </div>
          </>
        )}

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-slate-50">
          <div className="py-6 lg:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
