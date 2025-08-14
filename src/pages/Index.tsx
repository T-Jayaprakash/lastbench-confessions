import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { CreatePost } from "@/components/post/CreatePost";
import { ProfileView } from "@/components/profile/ProfileView";
import { CommentsModal } from "@/components/comments/CommentsModal";
import { ShareModal } from "@/components/share/ShareModal";
import { SearchBar } from "@/components/search/SearchBar";
import { FeedSkeleton } from "@/components/ui/loading-skeletons";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

// Mock data for demonstration
const mockPosts = [
  {
    id: "1",
    content: "Just overheard in the library: 'I've been pretending to understand calculus for 3 years' 😂 Same energy tbh",
    author: "Student#847",
    timeAgo: "2m ago",
    likes: 24,
    comments: 5,
    isLiked: false,
    department: "Engineering"
  },
  {
    id: "2", 
    content: "Someone in my hostel has been stealing everyone's maggi noodles. Plot twist: it's probably the warden 🍜",
    author: "Student#203",
    timeAgo: "15m ago",
    likes: 67,
    comments: 12,
    isLiked: true,
    department: "Arts"
  },
  {
    id: "3",
    content: "Confession: I've been using ChatGPT for all my assignments and somehow my grades improved. The education system is broken 📚",
    author: "Student#501",
    timeAgo: "1h ago", 
    likes: 156,
    comments: 23,
    isLiked: false,
    department: "Engineering"
  }
];

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [posts, setPosts] = useState(mockPosts);
  const [filteredPosts, setFilteredPosts] = useState(mockPosts);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [username, setUsername] = useState("Student#847");
  const [canChangeUsername, setCanChangeUsername] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<Record<string, any[]>>({
    "1": [
      {
        id: "c1",
        content: "Relatable! I'm still googling basic concepts 😅",
        author: "Student#123",
        timeAgo: "1m ago",
        likes: 5,
        isLiked: false
      }
    ]
  });
  const { toast } = useToast();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return <FeedSkeleton />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Filter posts based on search and filters
  useEffect(() => {
    let filtered = posts;
    
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    switch (activeFilter) {
      case "trending":
        filtered = filtered.sort((a, b) => b.likes - a.likes);
        break;
      case "recent":
        filtered = filtered.sort((a, b) => new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime());
        break;
      case "dept":
        filtered = filtered.filter(post => post.department === "Engineering");
        break;
      default:
        break;
    }
    
    setFilteredPosts(filtered);
  }, [posts, searchQuery, activeFilter]);

  const handleTabChange = (tab: string) => {
    if (tab === "post") {
      setShowCreatePost(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleCreatePost = (content: string, image?: File) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newPost = {
        id: Date.now().toString(),
        content,
        author: username,
        timeAgo: "now",
        likes: 0,
        comments: 0,
        isLiked: false,
        department: "Engineering"
      };
      
      setPosts([newPost, ...posts]);
      setShowCreatePost(false);
      setActiveTab("home");
      setIsLoading(false);
      
      toast({
        title: "Posted successfully!",
        description: "Your anonymous gossip is now live.",
      });
    }, 1000);
  };

  const handleLike = (id: string) => {
    setPosts(posts.map(post => 
      post.id === id 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleComment = (id: string) => {
    setSelectedPostId(id);
    setShowComments(true);
  };

  const handleShare = (id: string) => {
    setSelectedPostId(id);
    setShowShare(true);
  };

  const handleAddComment = (postId: string, content: string) => {
    const newComment = {
      id: `c${Date.now()}`,
      content,
      author: username,
      timeAgo: "now",
      likes: 0,
      isLiked: false
    };
    
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));
    
    // Update comment count in posts
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));
    
    toast({
      title: "Comment added!",
      description: "Your comment has been posted.",
    });
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(postId => {
        updated[postId] = updated[postId].map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
              }
            : comment
        );
      });
      return updated;
    });
  };

  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername);
    setCanChangeUsername(false);
    toast({
      title: "Username updated!",
      description: "You can only change your username once.",
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const selectedPost = posts.find(post => post.id === selectedPostId);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 max-w-md mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Lastbench
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16">
        {activeTab === "home" && (
          <>
            <SearchBar
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              activeFilter={activeFilter}
            />
            {isLoading ? (
              <FeedSkeleton />
            ) : (
              <FeedTabs
                posts={filteredPosts}
                userDepartment="Engineering"
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
              />
            )}
          </>
        )}
        
        {activeTab === "profile" && (
          <ProfileView
            username={username}
            postsCount={posts.filter(p => p.author === username).length}
            likesCount={posts.filter(p => p.author === username).reduce((sum, p) => sum + p.likes, 0)}
            commentsCount={Object.values(comments).flat().filter(c => c.author === username).length}
            onUsernameChange={handleUsernameChange}
            canChangeUsername={canChangeUsername}
          />
        )}
      </main>

      {/* Comments Modal */}
      {showComments && selectedPost && (
        <CommentsModal
          postId={selectedPostId}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          comments={comments[selectedPostId] || []}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
        />
      )}

      {/* Share Modal */}
      {showShare && selectedPost && (
        <ShareModal
          postId={selectedPostId}
          postContent={selectedPost.content}
          isOpen={showShare}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onPost={handleCreatePost}
          onCancel={() => setShowCreatePost(false)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;
