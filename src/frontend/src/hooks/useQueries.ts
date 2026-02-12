import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Article, Review, Bike, Comment, Rating, UserProfile, Category, Region, ContentStatus, ContentType, PriceRange, ColorOption, ImageType } from '../backend';
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
      contentType,
    }: {
      title: string;
      content: string;
      author: string;
      category: Category;
      region: Region;
      status: ContentStatus;
      contentType?: ContentType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrSaveArticle(title, content, author, category, region, status, contentType || null);
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

export function useDeleteArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteArticle(articleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['myDraftArticles'] });
      toast.success('Article deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete article');
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
      contentType,
      pros,
      cons,
      rating,
    }: {
      title: string;
      content: string;
      author: string;
      score: { performance: number; design: number; comfort: number; value: number };
      bikeId: bigint;
      region: Region;
      status: ContentStatus;
      contentType?: ContentType;
      pros?: string[];
      cons?: string[];
      rating?: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrSaveReview(
        title,
        content,
        author,
        score,
        bikeId,
        region,
        status,
        contentType || null,
        pros || [],
        cons || [],
        rating || 0
      );
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

export function useDeleteReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteReview(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['myDraftReviews'] });
      toast.success('Review deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete review');
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
      mainImages,
      details,
      region,
      colorOptions,
      brandLogo,
    }: {
      name: string;
      brand: string;
      specs: string;
      priceRange: PriceRange;
      mainImages: ImageType[];
      details: string;
      region: Region;
      colorOptions: ColorOption[];
      brandLogo: ImageType | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBike(name, brand, specs, priceRange, mainImages, details, region, colorOptions, brandLogo);
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
      } else if (message.includes('Actor not available')) {
        toast.error('Connection not ready. Please wait and try again.');
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
      mainImages,
      details,
      region,
      colorOptions,
      brandLogo,
    }: {
      bikeId: bigint;
      name: string;
      brand: string;
      specs: string;
      priceRange: PriceRange;
      mainImages: ImageType[];
      details: string;
      region: Region;
      colorOptions: ColorOption[];
      brandLogo: ImageType | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editBike(bikeId, name, brand, specs, priceRange, mainImages, details, region, colorOptions, brandLogo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bikes'] });
      queryClient.invalidateQueries({ queryKey: ['userBikes'] });
      toast.success('Bike updated successfully');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to update bike';
      if (message.includes('Unauthorized')) {
        toast.error('You do not have permission to edit this bike');
      } else if (message.includes('Actor not available')) {
        toast.error('Connection not ready. Please wait and try again.');
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
        toast.error('You do not have permission to delete this bike');
      } else {
        toast.error(message);
      }
    },
  });
}

export function useSeedPopularBikes() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.seedPopularBikeEntries();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bikes'] });
      toast.success('Popular bikes seeded successfully');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to seed bikes';
      if (message.includes('Unauthorized')) {
        toast.error('Only admins can seed bikes');
      } else {
        toast.error(message);
      }
    },
  });
}

// Comments
export function useGetCommentsByReview(reviewId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', reviewId?.toString()],
    queryFn: async () => {
      if (!actor || !reviewId) return [];
      return actor.getCommentsByReview(reviewId);
    },
    enabled: !!actor && !isFetching && reviewId !== null,
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
      const message = error.message || 'Failed to post comment';
      if (message.includes('Unauthorized')) {
        toast.error('You must be signed in to comment');
      } else {
        toast.error(message);
      }
    },
  });
}

export function useHideComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, reviewId }: { commentId: bigint; reviewId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.hideComment(commentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.reviewId.toString()] });
      toast.success('Comment hidden successfully');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to hide comment';
      if (message.includes('Unauthorized')) {
        toast.error('Only admins can hide comments');
      } else {
        toast.error(message);
      }
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, reviewId }: { commentId: bigint; reviewId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteComment(commentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.reviewId.toString()] });
      toast.success('Comment deleted successfully');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to delete comment';
      if (message.includes('Unauthorized')) {
        toast.error('You can only delete your own comments');
      } else {
        toast.error(message);
      }
    },
  });
}

// Ratings
export function useGetReviewRatings(reviewId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Rating[]>({
    queryKey: ['ratings', reviewId?.toString()],
    queryFn: async () => {
      if (!actor || !reviewId) return [];
      return actor.getReviewRatings(reviewId);
    },
    enabled: !!actor && !isFetching && reviewId !== null,
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
      toast.success('Rating submitted successfully');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to submit rating';
      if (message.includes('Unauthorized')) {
        toast.error('You must be signed in to rate');
      } else {
        toast.error(message);
      }
    },
  });
}

// User Drafts
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

export function useSaveCallerUserProfile() {
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
      const message = error.message || 'Failed to save profile';
      if (message.includes('Unauthorized')) {
        toast.error('You must be signed in to save your profile');
      } else {
        toast.error(message);
      }
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) return 'guest';
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBrandLogos() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['brandLogos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBrandLogos();
    },
    enabled: !!actor && !isFetching,
  });
}
