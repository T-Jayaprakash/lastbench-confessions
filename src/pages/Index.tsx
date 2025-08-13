import { useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { CreatePost } from "@/components/post/CreatePost";
import { ProfileView } from "@/components/profile/ProfileView";
import { useToast } from "@/hooks/use-toast";

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
  const [activeTab, setActiveTab] = useState("home");
  const [posts, setPosts] = useState(mockPosts);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [username, setUsername] = useState("Student#847");
  const [canChangeUsername, setCanChangeUsername] = useState(true);
  const { toast } = useToast();

  const handleTabChange = (tab: string) => {
    if (tab === "post") {
      setShowCreatePost(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleCreatePost = (content: string, image?: File) => {
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
    
    toast({
      title: "Posted successfully!",
      description: "Your anonymous gossip is now live.",
    });
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
    toast({
      title: "Comments coming soon!",
      description: "Real-time comments will be available once backend is connected.",
    });
  };

  const handleShare = (id: string) => {
    toast({
      title: "Share feature coming soon!",
      description: "Share posts via WhatsApp, Instagram and more.",
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-center h-16 px-4 max-w-md mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Lastbench
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16">
        {activeTab === "home" && (
          <FeedTabs
            posts={posts}
            userDepartment="Engineering"
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        )}
        
        {activeTab === "profile" && (
          <ProfileView
            username={username}
            postsCount={1}
            likesCount={67}
            commentsCount={12}
            onUsernameChange={handleUsernameChange}
            canChangeUsername={canChangeUsername}
          />
        )}
      </main>

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
