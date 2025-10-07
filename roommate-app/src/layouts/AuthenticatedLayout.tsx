import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";

function AuthenticatedLayout() {
  return (
    <>
      {/* Responsive Navbar: Bottom on mobile, left on larger screens */}
      <div className="flex flex-col md:flex-row h-screen">
        {/* Sidebar/Navbar */}
        <SidebarProvider>
          <AppSidebar />
          {/* Main Content */}
          <main className="overflow-y-auto">
            <SidebarTrigger className="md:hidden fixed bottom-4 right-4 z-20 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition" />
            <Outlet />
          </main>
        </SidebarProvider>
      </div>
    </>
  );
}

export default AuthenticatedLayout;
