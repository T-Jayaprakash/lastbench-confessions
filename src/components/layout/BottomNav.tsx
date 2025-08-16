import { Home, Plus, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "post", icon: Plus, label: "Post" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border z-50">
      <div className="flex items-center justify-between h-16 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isPost = tab.id === "post";
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-smooth tap-effect",
                isPost && "bg-gradient-primary p-3 shadow-primary",
                !isPost && isActive && "text-primary",
                !isPost && !isActive && "text-muted-foreground"
              )}
            >
              <Icon 
                size={isPost ? 24 : 20} 
                className={cn(
                  isPost && "text-white",
                  !isPost && "transition-smooth"
                )}
              />
              <span className={cn(
                "text-xs mt-1 font-medium",
                isPost && "text-white",
                !isPost && isActive && "text-primary",
                !isPost && !isActive && "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};