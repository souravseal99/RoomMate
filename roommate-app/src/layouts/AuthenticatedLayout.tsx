import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/app/AppHeader';
import { AppFooter } from '@/components/app/AppFooter';
import { MobileBottomNav } from '@/components/app/sidebar/MobileBottomNav';

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Stitch Fixed Top Navigation Header */}
      <AppHeader />

      {/* Main Canvas Area */}
      <main className="flex-1 w-full pt-20 pb-24 md:pb-6 lg:pb-8 flex flex-col">
        <div className="w-full max-w-[1520px] mx-auto px-4 md:px-8 py-6 flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>

      {/* Stitch House OS Footer */}
      <AppFooter />

      {/* Mobile Bottom Navigation Bar (visible on mobile / < lg viewports) */}
      <MobileBottomNav />
    </div>
  );
}

export default AuthenticatedLayout;
