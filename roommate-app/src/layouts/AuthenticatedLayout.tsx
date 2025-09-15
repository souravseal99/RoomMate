import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/layouts/AppSidebar";

function AuthenticatedLayout() {
  return (
    <>
      {/* Responsive Navbar: Bottom on mobile, left on larger screens */}
      <div className="flex flex-col md:flex-row h-screen">
        {/* Sidebar/Navbar */}
        <SidebarProvider>
          <AppSidebar />
          <SidebarTrigger className="md:hidden fixed bottom-4 right-4 z-20 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition" />
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto pt-4 pb-16 md:pb-0 md:pl-64">
            <h2 className="text-xl font-semibold mb-4">
              You are authenticated
            </h2>
            <Outlet />
          </main>
          <span className="sr-only">Toggle Menu</span>
        </SidebarProvider>
      </div>
    </>
  );
}

export default AuthenticatedLayout;
