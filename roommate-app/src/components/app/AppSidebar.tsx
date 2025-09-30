import {
  LayoutDashboard,
  HouseWifi,
  BrushCleaning,
  HandCoins,
  ShoppingBag,
} from "lucide-react";

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
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Roommate App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
        <NavUserDummy
          user={{
            name: "John Doe",
            email: "you.example@mail.com",
            avatar: "https://github.com/evilrabbit.png",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
