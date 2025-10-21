import {
  LayoutDashboard,
  HouseWifi,
  BrushCleaning,
  HandCoins,
  ShoppingBag,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUserDummy } from "./SidebarFooterDummy";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Households",
    url: "/households",
    icon: HouseWifi,
  },
  {
    title: "Chores",
    url: "/chores",
    icon: BrushCleaning,
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: HandCoins,
  },
  {
    title: "Inventory",
    url: "#",
    icon: ShoppingBag,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { email, name } = useAuth();
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Roommate App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between p-2">
          <ThemeToggle />
        </div>
        <NavUserDummy
          user={{
            name: name || "User",
            email: email || "user@example.com",
            avatar: "https://github.com/evilrabbit.png",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
