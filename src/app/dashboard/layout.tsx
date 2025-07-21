"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardProvider } from "@/contexts/DashboardContext";
import Sidebar from "@/components/SideBar";
import PaidRoute from "@/components/PaidRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { status, session } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Check onboarding status when user is authenticated
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (status === "authenticated" && session?.user) {
        try {
          const response = await fetch("/api/auth/onboarding-status");
          const data = await response.json();

          if (
            data.success &&
            !data.onboardingComplete &&
            pathname !== "/dashboard/onboarding"
          ) {
            router.push("/dashboard/onboarding");
            return;
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        } finally {
          setIsCheckingOnboarding(false);
        }
      } else if (status === "unauthenticated") {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [status, session, pathname, router]);

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

  // Show loading while checking onboarding status
  if (isCheckingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardProvider>
        <PaidRoute>
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
            <div className="flex-1 flex flex-col">
              {/* Mobile header with hamburger menu */}
              <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6"
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
                <h1 className="text-lg font-semibold">Dashboard</h1>
                <div className="w-10"></div> {/* Spacer for centering */}
              </div>

              {/* Content */}
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </div>
        </PaidRoute>
      </DashboardProvider>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
