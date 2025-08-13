import { Share2, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  postId: string;
  postContent: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal = ({ postId, postContent, isOpen, onClose }: ShareModalProps) => {
  const { toast } = useToast();

  const handleShare = async (platform: string) => {
    const shareText = `Check out this gossip on Lastbench: "${postContent}"`;
    const shareUrl = `https://lastbench.app/post/${postId}`;
    
    try {
      if (platform === 'copy') {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({
          title: "Link copied!",
          description: "Post link copied to clipboard.",
        });
      } else if (platform === 'whatsapp') {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
        window.open(whatsappUrl, '_blank');
      } else if (platform === 'native' && navigator.share) {
        await navigator.share({
          title: 'Lastbench Gossip',
          text: shareText,
          url: shareUrl,
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share this post.",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full max-w-md mx-auto bg-gradient-card rounded-t-3xl shadow-glow border-t border-border animate-slide-up">
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground text-center">Share Post</h3>
          
          <div className="space-y-3">
            {navigator.share && (
              <Button
                onClick={() => handleShare('native')}
                variant="ghost"
                className="w-full flex items-center justify-start space-x-3 p-4 rounded-xl hover:bg-secondary/50 transition-smooth tap-effect"
              >
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-primary">
                  <Share2 size={20} className="text-white" />
                </div>
                <span className="text-foreground">Share via...</span>
              </Button>
            )}
            
            <Button
              onClick={() => handleShare('whatsapp')}
              variant="ghost"
              className="w-full flex items-center justify-start space-x-3 p-4 rounded-xl hover:bg-secondary/50 transition-smooth tap-effect"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <span className="text-foreground">WhatsApp</span>
            </Button>
            
            <Button
              onClick={() => handleShare('copy')}
              variant="ghost"
              className="w-full flex items-center justify-start space-x-3 p-4 rounded-xl hover:bg-secondary/50 transition-smooth tap-effect"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Copy size={20} className="text-white" />
              </div>
              <span className="text-foreground">Copy Link</span>
            </Button>
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full mt-4 py-3 rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};