import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { CreatePost } from "@/components/post/CreatePost";
import { ProfileView } from "@/components/profile/ProfileView";
import { SettingsView } from "@/components/settings/SettingsView";
import { CommentsModal } from "@/components/comments/CommentsModal";
import { ShareModal } from "@/components/share/ShareModal";
import { SearchBar } from "@/components/search/SearchBar";
import { FeedSkeleton } from "@/components/ui/loading-skeletons";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";
import { useComments } from "@/hooks/useComments";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";


const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { posts, isLoading: postsLoading, createPost, toggleLike } = usePosts();
  const { comments, loadComments, createComment, toggleCommentLike } = useComments();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState("home");
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
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
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    switch (activeFilter) {
      case "trending":
        filtered = filtered.sort((a, b) => b.likes_count - a.likes_count);
        break;
      case "recent":
        filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "dept":
        filtered = filtered.filter(post => !post.is_college_wide);
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

  const handleCreatePost = async (content: string, images?: File[], isCollegeWide?: boolean, departmentId?: string) => {
    await createPost(content, images, isCollegeWide, departmentId);
    setShowCreatePost(false);
    setActiveTab("home");
  };

  const handleLike = async (id: string) => {
    await toggleLike(id);
  };

  const handleComment = async (id: string) => {
    setSelectedPostId(id);
    await loadComments(id);
    setShowComments(true);
  };

  const handleShare = (id: string) => {
    setSelectedPostId(id);
    setShowShare(true);
  };

  const handleAddComment = async (postId: string, content: string) => {
    await createComment(postId, content);
  };

  const handleLikeComment = async (commentId: string) => {
    await toggleCommentLike(commentId, selectedPostId);
  };

  const handleUsernameChange = (newUsername: string) => {
    // For now, just show a message since usernames are anonymous
    toast({
      title: "Username is anonymous",
      description: "Your identity remains anonymous for privacy.",
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
            {postsLoading ? (
              <FeedSkeleton />
            ) : (
              <FeedTabs
                posts={filteredPosts}
                userDepartment={profile?.department_id || ""}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
              />
            )}
          </>
        )}
        
        {activeTab === "profile" && (
          <ProfileView
            username={profile?.anonymous_name || "Anonymous"}
            postsCount={posts.filter(p => p.user_id === user?.id).length}
            likesCount={posts.filter(p => p.user_id === user?.id).reduce((sum, p) => sum + p.likes_count, 0)}
            commentsCount={Object.values(comments).flat().filter(c => c.user_id === user?.id).length}
            onUsernameChange={handleUsernameChange}
            canChangeUsername={false}
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
          onCancel={() => setShowCreatePost(false)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;
