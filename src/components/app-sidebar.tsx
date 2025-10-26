import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, UploadCloud, MessageSquare, Settings, Bot } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
const menuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/upload", icon: UploadCloud, label: "Upload & Pipeline" },
  { href: "/chat", icon: MessageSquare, label: "Chatbot" },
  { href: "/settings", icon: Settings, label: "Settings" },
];
export function AppSidebar(): JSX.Element {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Bot className="w-8 h-8 text-primary-accent" />
          <span className="text-lg font-heading font-bold">DataBloom AI</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "w-full",
                    isActive && "is-active"
                  )
                }
              >
                {({ isActive }) => (
                  <SidebarMenuButton variant={isActive ? "primary" : "ghost"} className="w-full justify-start">
                    <item.icon className="size-5 mr-3" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}