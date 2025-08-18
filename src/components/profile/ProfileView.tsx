import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Edit3, Settings, Heart, MessageSquare, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";

interface ProfileViewProps {
  username: string;
  postsCount: number;
  likesCount: number;
  commentsCount: number;
  onUsernameChange: (newUsername: string) => void;
  canChangeUsername: boolean;
}

export const ProfileView = ({
  username,
  postsCount,
  likesCount,
  commentsCount,
  onUsernameChange,
  canChangeUsername
}: ProfileViewProps) => {
  const navigate = useNavigate();
  const { profile, updateProfilePicture, isUploading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (newUsername.trim() && newUsername !== username) {
      onUsernameChange(newUsername.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewUsername(username);
    setIsEditing(false);
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await updateProfilePicture(file);
    }
  };

  const stats = [
    { icon: MessageSquare, label: "Posts", value: postsCount, color: "text-blue-400" },
    { icon: Heart, label: "Likes", value: likesCount, color: "text-red-400" },
    { icon: MessageSquare, label: "Comments", value: commentsCount, color: "text-green-400" },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-4 pb-20">
      {/* Profile Card */}
      <Card className="bg-gradient-card shadow-card border-border/50 mb-6">
        <CardHeader className="text-center pb-4">
          <div 
            className="relative w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-primary cursor-pointer group"
            onClick={handleProfilePictureClick}
          >
            {profile?.profile_picture_url ? (
              <img 
                src={profile.profile_picture_url} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={32} className="text-white" />
            )}
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="text-center bg-background/50 border-border/50 focus:border-primary"
                  maxLength={20}
                />
                <div className="flex space-x-2 justify-center">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="bg-gradient-primary text-white px-4 rounded-full"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    size="sm"
                    className="px-4 rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <CardTitle className="text-foreground">{username}</CardTitle>
                {canChangeUsername && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="p-1 rounded-full hover:bg-secondary"
                  >
                    <Edit3 size={16} />
                  </Button>
                )}
              </div>
            )}
            
            {!canChangeUsername && (
              <p className="text-muted-foreground text-sm">
                Username cannot be changed
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={cn("flex items-center justify-center mb-2", stat.color)}>
                    <Icon size={20} />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Settings */}
          <Button
            variant="ghost"
            onClick={() => navigate('/settings')}
            className="w-full flex items-center justify-center space-x-2 rounded-xl hover:bg-secondary"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Button>
        </CardContent>
      </Card>

      {/* Anonymous Info */}
      <Card className="bg-gradient-card shadow-card border-border/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-foreground">Anonymous & Safe</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your identity is completely anonymous. Posts cannot be traced back to you. 
              Share freely and safely with your college community.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};