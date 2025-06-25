'use client';

import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { 
  BarChart3, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  Search,
  AlertCircle,
  Users,
  Home,
  Plus
} from 'lucide-react';

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Mentions",
    url: "#",
    icon: MessageSquare,
  },
  {
    title: "Analytics",
    url: "#",
    icon: BarChart3,
  },
  {
    title: "Sentiment",
    url: "#",
    icon: TrendingUp,
  },
  {
    title: "Alerts",
    url: "#",
    icon: AlertCircle,
  },
  {
    title: "Subreddits",
    url: "#",
    icon: Users,
  },
];

const toolsItems = [
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Add Keywords",
    url: "#",
    icon: Plus,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-6">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          Reddit Monitor
        </h2>
        <p className="text-sm text-sidebar-foreground/70">
          Social Listening
        </p>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.title === "Dashboard"}>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-sidebar-foreground/60">
          v1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
