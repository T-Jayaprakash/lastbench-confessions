import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { PostCard } from "@/components/posts/PostCard";
import { Flame, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  author: string;
  timeAgo: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  image?: string;
  images?: string[];
  department?: string;
}

interface FeedTabsProps {
  posts: Post[];
  userDepartment?: string;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
}

export const FeedTabs = ({ 
  posts, 
  userDepartment, 
  onLike, 
  onComment, 
  onShare 
}: FeedTabsProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  
  const departmentPosts = posts.filter(post => 
    post.department === userDepartment
  );

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const tabs = [
    { 
      id: "trending", 
      label: "Trending", 
      icon: Flame, 
      posts: posts,
      emptyMessage: "No posts yet. Be the first to share!"
    },
    { 
      id: "department", 
      label: "Dept", 
      icon: GraduationCap, 
      posts: departmentPosts,
      emptyMessage: "No posts from your department yet."
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tab Indicators */}
      <div className="flex justify-center mb-4 px-4">
        <div className="flex bg-card/50 backdrop-blur-sm rounded-full p-1">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-full transition-smooth",
                  current === index 
                    ? "bg-gradient-primary text-white shadow-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Swipeable Content */}
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: false,
        }}
      >
        <CarouselContent>
          {tabs.map((tab) => (
            <CarouselItem key={tab.id}>
              <div className="pb-20">
                {tab.posts.length > 0 ? (
                  tab.posts.map((post) => (
                    <PostCard
                      key={post.id}
                      {...post}
                      onLike={onLike}
                      onComment={onComment}
                      onShare={onShare}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-primary">
                    {(() => { const EmptyIcon = tab.icon; return <EmptyIcon size={24} className="text-white" />; })()}
                  </div>
                    <p className="text-muted-foreground">{tab.emptyMessage}</p>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};