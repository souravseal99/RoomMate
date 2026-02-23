import * as Icons from "lucide-react";
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

// helper: resolve icon from lucide-react safely with fallback
const resolveIcon = (name: string) => (Icons as any)[name] ?? Icons.Square;

const items = [
  { title: "Dashboard", url: "/dashboard", iconName: "LayoutDashboard" },
  { title: "Households", url: "/households", iconName: "Home" },
  { title: "Chores", url: "/chores", iconName: "Broom" },
  { title: "Expenses", url: "/expenses", iconName: "Coins" },
  { title: "Inventory", url: "/inventory", iconName: "ShoppingBag" },
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
              {items.map((item) => {
                const Icon = resolveIcon(item.iconName);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <a href={item.url} className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
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
