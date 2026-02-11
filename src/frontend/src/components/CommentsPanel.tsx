import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCommentsByReview, useCreateComment, useDeleteComment, useHideComment } from '../hooks/useQueries';
import { useCurrentUser } from '../hooks/useCurrentUser';
import RequireAuthAction from './RequireAuthAction';
import ModerationMenu from './ModerationMenu';
import { MessageSquare } from 'lucide-react';

interface CommentsPanelProps {
  reviewId: bigint;
}

export default function CommentsPanel({ reviewId }: CommentsPanelProps) {
  const { data: comments, isLoading } = useGetCommentsByReview(reviewId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const hideComment = useHideComment();
  const { isAuthenticated, userProfile, isAdmin } = useCurrentUser();
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      await createComment.mutateAsync({ reviewId, content: content.trim() });
      setContent('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <RequireAuthAction action="comment">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            <Button type="submit" disabled={createComment.isPending || !content.trim()}>
              {createComment.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>
        </RequireAuthAction>

        {/* Comments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {userProfile && comment.author.toString() === userProfile.name ? 'You' : 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(Number(comment.createdAt) / 1000000).toLocaleDateString()}
                    </p>
                  </div>
                  {isAuthenticated && (
                    <ModerationMenu
                      commentId={comment.id}
                      isOwner={comment.author.toString() === userProfile?.name}
                      isAdmin={isAdmin}
                      onDelete={() => deleteComment.mutate(comment.id)}
                      onHide={() => hideComment.mutate(comment.id)}
                    />
                  )}
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
