"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/SideBar";
import { DashboardProvider } from "@/contexts/DashboardContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine active view from pathname
  const getActiveView = () => {
    if (pathname?.includes("/settings")) return "settings";
    return "feed";
  };

  const handleViewChange = (view: string) => {
    // Handle navigation based on the view
    if (view === "settings") {
      router.push("/dashboard/settings");
    } else if (view === "feed") {
      router.push("/dashboard");
    }
    setSidebarOpen(false); // Close mobile sidebar after navigation
  };

  return (
    <ProtectedRoute>
      <DashboardProvider>
        <div className="flex min-h-screen bg-white text-gray-900">
          {/* Sidebar (left) - hidden on mobile, visible on md+ */}
          <div className="w-64 border-r border-gray-200 bg-white hidden md:block">
            <Sidebar
              activeView={getActiveView()}
              onViewChange={handleViewChange}
            />
          </div>

          {/* Mobile sidebar drawer */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="w-64 bg-white border-r border-gray-200 h-full">
                <Sidebar
                  activeView={getActiveView()}
                  onViewChange={(view) => {
                    setSidebarOpen(false);
                    handleViewChange(view);
                  }}
                />
              </div>
              <div
                className="flex-1 bg-black bg-opacity-30"
                onClick={() => setSidebarOpen(false)}
              />
            </div>
          )}

          {/* Main content area */}
          <div className="flex-1 flex w-full">
            {/* Mobile menu button */}
            <div className="md:hidden fixed top-4 left-4 z-40">
              <button
                className="p-2 bg-white rounded-lg shadow-md"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Page content */}
            <div className="flex-1 w-full">{children}</div>
          </div>
        </div>
      </DashboardProvider>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
