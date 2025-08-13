import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/posts/PostCard";
import { Flame, GraduationCap } from "lucide-react";

interface Post {
  id: string;
  content: string;
  author: string;
  timeAgo: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  image?: string;
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
  const departmentPosts = posts.filter(post => 
    post.department === userDepartment
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm mx-4 mb-4">
          <TabsTrigger 
            value="trending" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
          >
            <Flame size={18} />
            <span>Trending</span>
          </TabsTrigger>
          <TabsTrigger 
            value="department"
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
          >
            <GraduationCap size={18} />
            <span>Dept</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="trending" className="space-y-0">
          <div className="pb-20">
            {posts.length > 0 ? (
              posts.map((post) => (
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
                  <Flame size={24} className="text-white" />
                </div>
                <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="department" className="space-y-0">
          <div className="pb-20">
            {departmentPosts.length > 0 ? (
              departmentPosts.map((post) => (
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
                  <GraduationCap size={24} className="text-white" />
                </div>
                <p className="text-muted-foreground">
                  No posts from your department yet.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};