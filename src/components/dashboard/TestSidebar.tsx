import { useState } from 'react';
import { Home, Calendar, User, LogOut } from 'lucide-react';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/aceternity-sidebar';

export const TestSidebar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Bookings", 
      href: "/bookings",
      icon: <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Profile",
      href: "/profile", 
      icon: <User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    }
  ];

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Test Dashboard</h1>
        <p>This is a test to verify the Aceternity sidebar is working.</p>
        <p>Hover over the sidebar to see the expand animation!</p>
      </div>
    </div>
  );
};
