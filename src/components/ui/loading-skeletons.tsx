import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PostCardSkeleton = () => {
  return (
    <Card className="bg-gradient-card shadow-card rounded-2xl p-4 mb-4 mx-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center space-x-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-full bg-muted/20" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-muted/20" />
          <Skeleton className="h-3 w-16 bg-muted/20" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-full bg-muted/20" />
        <Skeleton className="h-4 w-3/4 bg-muted/20" />
        <Skeleton className="h-4 w-1/2 bg-muted/20" />
      </div>

      {/* Actions Skeleton */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center space-x-6">
          <Skeleton className="h-8 w-16 rounded-full bg-muted/20" />
          <Skeleton className="h-8 w-16 rounded-full bg-muted/20" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full bg-muted/20" />
      </div>
    </Card>
  );
};

export const FeedSkeleton = () => {
  return (
    <div className="space-y-0">
      {Array.from({ length: 3 }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
};