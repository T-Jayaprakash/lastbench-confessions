import { useState } from "react";
import { Search, Filter, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

const filters = [
  { id: "all", label: "All", icon: TrendingUp },
  { id: "trending", label: "Hot", icon: TrendingUp },
  { id: "recent", label: "Recent", icon: TrendingUp },
  { id: "dept", label: "My Dept", icon: TrendingUp },
];

export const SearchBar = ({ onSearch, onFilterChange, activeFilter }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="p-4 space-y-3 bg-card/50 backdrop-blur-sm border-b border-border/50">
      {/* Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search posts..."
          className="pl-10 pr-12 bg-background/50 border-border/50 focus:border-primary rounded-full"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "absolute right-1 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-smooth",
            showFilters && "bg-primary text-primary-foreground"
          )}
        >
          <Filter size={16} />
        </Button>
      </div>

      {/* Filter Pills */}
      {showFilters && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 animate-fade-in">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <Badge
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "secondary"}
                onClick={() => onFilterChange(filter.id)}
                className={cn(
                  "flex items-center space-x-1 px-3 py-2 rounded-full cursor-pointer transition-bounce tap-effect whitespace-nowrap",
                  activeFilter === filter.id 
                    ? "bg-gradient-primary text-white shadow-primary" 
                    : "bg-secondary/50 hover:bg-secondary"
                )}
              >
                <Icon size={14} />
                <span className="text-sm font-medium">{filter.label}</span>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};