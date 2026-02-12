import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import CategoryListingPage from './pages/CategoryListingPage';
import ReviewDetailPage from './pages/ReviewDetailPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import BuyingGuideDetailPage from './pages/BuyingGuideDetailPage';
import ComparePage from './pages/ComparePage';
import SearchResultsPage from './pages/SearchResultsPage';
import CreateArticlePage from './pages/CreateArticlePage';
import CreateReviewPage from './pages/CreateReviewPage';
import MyDraftsPage from './pages/MyDraftsPage';
import BikeDetailPage from './pages/BikeDetailPage';
import ManageBikesPage from './pages/ManageBikesPage';
import BrandsPage from './pages/BrandsPage';
import BrandDetailPage from './pages/BrandDetailPage';
import SectionPalettesPage from './pages/SectionPalettesPage';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const categoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/category/$categoryId',
  component: CategoryListingPage,
});

const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review/$reviewId',
  component: ReviewDetailPage,
});

const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/article/$articleId',
  component: ArticleDetailPage,
});

const guideRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guide/$guideId',
  component: BuyingGuideDetailPage,
});

const compareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compare',
  component: ComparePage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: SearchResultsPage,
});

const createArticleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-article',
  component: CreateArticlePage,
});

const createReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-review',
  component: CreateReviewPage,
});

const myDraftsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-drafts',
  component: MyDraftsPage,
});

const bikeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bike/$bikeId',
  component: BikeDetailPage,
});

const manageBikesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manage-bikes',
  component: ManageBikesPage,
});

const brandsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/brands',
  component: BrandsPage,
});

const brandDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/brands/$brandId',
  component: BrandDetailPage,
});

const sectionPalettesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/section-palettes',
  component: SectionPalettesPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  categoryRoute,
  reviewRoute,
  articleRoute,
  guideRoute,
  compareRoute,
  searchRoute,
  createArticleRoute,
  createReviewRoute,
  myDraftsRoute,
  bikeDetailRoute,
  manageBikesRoute,
  brandsRoute,
  brandDetailRoute,
  sectionPalettesRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
