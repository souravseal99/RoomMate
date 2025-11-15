import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto w-full">
          <SidebarTrigger className="md:hidden fixed bottom-4 right-4 z-20 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition" />
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}

export default AuthenticatedLayout;
