import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Settings, MessageSquare } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";

interface SidebarProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { brands, loading } = useDashboard();

  // Determine active view from pathname
  const currentActiveView =
    activeView || (pathname?.includes("/settings") ? "settings" : "feed");
  const menuItems = [
    { id: "feed", label: "Feed", icon: MessageSquare },
    // { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    // { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Get all keywords from all brands
  const allKeywords = brands.flatMap((brand) =>
    brand.keywords.map((keyword) => ({
      id: keyword.id,
      label: keyword.name,
      color: keyword.color,
      type: keyword.type,
      brandName: brand.name,
    }))
  );

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 fixed top-0 left-0 h-screen p-4 overflow-y-auto z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
          <img src="/icon.svg" alt="Logo" className="w-8 h-8" />
        </div>
        <span className="font-semibold text-gray-900">
          Social Brand Monitoring
        </span>
      </div>

      {/* Main Menu */}
      <nav className="space-y-1 mb-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (onViewChange) {
                onViewChange(item.id);
              } else if (item.id === "settings") {
                router.push("/dashboard/settings");
              } else if (item.id === "feed") {
                router.push("/dashboard");
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
              currentActiveView === item.id
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Keywords Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Keywords
          </h3>
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading keywords...</span>
            </div>
          ) : allKeywords.length > 0 ? (
            allKeywords.map((keyword) => (
              <div
                key={keyword.id}
                className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700"
              >
                <div className={`w-2 h-2 rounded-full ${keyword.type === 'Own Brand' ? 'bg-blue-500' : keyword.type === 'Competitor' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="flex-1 truncate">{keyword.label}</span>
                <button className="text-gray-400 hover:text-gray-600"></button>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500">No keywords found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
