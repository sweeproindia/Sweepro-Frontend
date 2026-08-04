import { DashboardNavbar } from './DashboardNavbar';
import { MaidDashboardSidebar } from './MaidDashboardSidebar';
import { useState } from 'react';

interface MaidDashboardLayoutProps {
  children: React.ReactNode;
}

export const MaidDashboardLayout = ({ children }: MaidDashboardLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Navigation */}
      <DashboardNavbar 
        userType="maid"
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main content area with sidebar and page content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop (always visible on desktop) */}
        <div className="hidden lg:block">
          <MaidDashboardSidebar />
        </div>
        
        {/* Mobile / Tablet Sidebar (controlled by navbar hamburger) */}
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <MaidDashboardSidebar open={true} setOpen={setIsMobileSidebarOpen} forceOpen={true} />
            </div>
          </>
        )}

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};