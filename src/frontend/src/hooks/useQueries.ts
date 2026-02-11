import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Article, Review, Bike, Comment, Rating, UserProfile, Category, Region, ContentStatus, PriceRange } from '../backend';
import { toast } from 'sonner';

// Articles - Public (published only)
export function useGetAllArticles() {
  const { actor, isFetching } = useActor();

  return useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPublishedArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrSaveArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      content,
      author,
      category,
      region,
      status,
    }: {
      title: string;
      content: string;
      author: string;
      category: Category;
      region: Region;
      status: ContentStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrSaveArticle(title, content, author, category, region, status);
    },
    onSuccess: (_, variables) => {
      if (variables.status === 'published') {
        queryClient.invalidateQueries({ queryKey: ['articles'] });
        toast.success('Article published successfully');
      } else {
        queryClient.invalidateQueries({ queryKey: ['myDraftArticles'] });
        toast.success('Article saved as draft');
      }
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to save article';
      if (message.includes('Unauthorized')) {
        toast.error('You must be signed in to create articles');
      } else {
        toast.error(message);
      }
    },
  });
}

export function useGetMyDraftArticles() {
  const { actor, isFetching } = useActor();

  return useQuery<Article[]>({
    queryKey: ['myDraftArticles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyDraftArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePublishArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.publishArticle(articleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['myDraftArticles'] });
      toast.success('Article published successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to publish article');
    },
  });
}

// Reviews - Public (published only)
export function useGetAllReviews() {
  const { actor, isFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['reviews'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPublishedReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrSaveReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      content,
      author,
      score,
      bikeId,
      region,
      status,
    }: {
      title: string;
      content: string;
      author: string;
      score: { performance: number; design: number; comfort: number; value: number };
      bikeId: bigint;
      region: Region;
      status: ContentStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrSaveReview(title, content, author, score, bikeId, region, status);
    },
    onSuccess: (_, variables) => {
      if (variables.status === 'published') {
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        toast.success('Review published successfully');
      } else {
        queryClient.invalidateQueries({ queryKey: ['myDraftReviews'] });
        toast.success('Review saved as draft');
      }
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to save review';
      if (message.includes('Unauthorized')) {
        toast.error('You must be signed in to create reviews');
      } else {
        toast.error(message);
      }
    },
  });
}

export function useGetMyDraftReviews() {
  const { actor, isFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['myDraftReviews'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyDraftReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePublishReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.publishReview(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['myDraftReviews'] });
      toast.success('Review published successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to publish review');
    },
  });
}

// Bikes
export function useGetAllBikes() {
  const { actor, isFetching } = useActor();

  return useQuery<Bike[]>({
    queryKey: ['bikes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBikes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBikeById(bikeId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Bike | null>({
    queryKey: ['bike', bikeId?.toString()],
    queryFn: async () => {
      if (!actor || !bikeId) return null;
      return actor.getBikeById(bikeId);
    },
    enabled: !!actor && !isFetching && bikeId !== null,
  });
}

export function useGetUserBikes() {
  const { actor, isFetching } = useActor();

  return useQuery<Bike[]>({
    queryKey: ['userBikes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserBikes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      brand,
      specs,
      priceRange,
      images,
      details,
      region,
    }: {
      name: string;
      brand: string;
      specs: string;
      priceRange: PriceRange;
      images: string[];
      details: string;
      region: Region;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBike(name, brand, specs, priceRange, images, details, region);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bikes'] });
      queryClient.invalidateQueries({ queryKey: ['userBikes'] });
      toast.success('Bike created successfully');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to create bike';
      if (message.includes('Unauthorized')) {
        toast.error('You must be signed in to create bikes');
      } else {
        toast.error(message);
      }
    },
  });
}

export function useEditBike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bikeId,
      name,
      brand,
      specs,
      priceRange,
      images,
      details,
      region,
    }: {
      bikeId: bigint;
      name: string;
      brand: string;
      specs: string;
      priceRange: PriceRange;
      images: string[];
      details: string;
      region: Region;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editBike(bikeId, name, brand, specs, priceRange, images, details, region);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bikes'] });
      queryClient.invalidateQueries({ queryKey: ['bike', variables.bikeId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['userBikes'] });
      toast.success('Bike updated successfully');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to update bike';
      if (message.includes('Unauthorized')) {
        toast.error('You must be signed in to edit bikes');
      } else {
        toast.error(message);
      }
    },
  });
}

export function useDeleteBike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bikeId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBike(bikeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bikes'] });
      queryClient.invalidateQueries({ queryKey: ['userBikes'] });
      toast.success('Bike deleted successfully');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to delete bike';
      if (message.includes('Unauthorized')) {
        toast.error('You must be signed in to delete bikes');
      } else {
        toast.error(message);
      }
    },
  });
}

// Comments
export function useGetCommentsByReview(reviewId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', reviewId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommentsByReview(reviewId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, content }: { reviewId: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createComment(reviewId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.reviewId.toString()] });
      toast.success('Comment posted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to post comment');
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
}

export function useHideComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.hideComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment hidden');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to hide comment');
    },
  });
}

// Ratings
export function useGetReviewRatings(reviewId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Rating[]>({
    queryKey: ['ratings', reviewId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReviewRatings(reviewId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRateReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, rating }: { reviewId: bigint; rating: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rateReview(reviewId, rating);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', variables.reviewId.toString()] });
      toast.success('Rating submitted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit rating');
    },
  });
}

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) return 'guest';
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
