import { DashboardNavbar } from './DashboardNavbar';
import { DashboardSidebar } from './DashboardSidebar';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top navigation */}
      <DashboardNavbar 
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main content area with sidebar and page content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop (always visible) */}
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        
        {/* Mobile Sidebar (controlled by navbar hamburger) */}
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 md:hidden">
              <DashboardSidebar open={true} setOpen={setIsMobileSidebarOpen} />
            </div>
          </>
        )}

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export { DashboardLayout };