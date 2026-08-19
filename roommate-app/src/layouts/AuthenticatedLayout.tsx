import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/app/AppSidebar';
import { AppBar } from '@/components/app/sidebar/AppBar';
import { MobileBottomNav } from '@/components/app/sidebar/MobileBottomNav';

function AuthenticatedLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar (visible on md and above) */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Top App Bar (visible only on mobile) */}
        <AppBar />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto w-full pb-24 md:pb-6 px-4 md:px-8 pt-4 md:pt-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (visible only on mobile) */}
      <MobileBottomNav />
    </div>
  );
}

export default AuthenticatedLayout;
