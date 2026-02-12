import { Link, useNavigate } from '@tanstack/react-router';
import { Search, Menu, PlusCircle, FileText, Wrench, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthButton from './AuthButton';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useRegionContext } from '../hooks/useRegionContext';
import type { Region } from '../backend';

const categories = [
  { id: 'news', label: 'News' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'electric', label: 'Electric' },
  { id: 'racing', label: 'Racing' },
  { id: 'concepts', label: 'Concepts' },
  { id: 'brands', label: 'Brands', path: '/brands' },
  { id: 'comparisons', label: 'Compare' },
  { id: 'buyingGuides', label: 'Buying Guides' },
];

const regionOptions = [
  { value: 'all', label: 'All Regions' },
  { value: 'asia', label: 'Asia' },
  { value: 'europe', label: 'Europe' },
  { value: 'usa', label: 'USA' },
  { value: 'middleEast', label: 'Middle East' },
];

export default function AppHeader() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useCurrentUser();
  const { selectedRegion, setSelectedRegion } = useRegionContext();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: '/search', search: { q: searchQuery } });
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 shrink-0">
          <img
            src="/assets/generated/revnation-wordmark.dim_512x160.png"
            alt="RevNation"
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.path || (cat.id === 'comparisons' ? '/compare' : '/category/$categoryId')}
              params={cat.path || cat.id === 'comparisons' ? undefined : { categoryId: cat.id }}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        {/* Search, Region & Actions */}
        <div className="flex items-center gap-2">
          {/* Desktop Region Selector */}
          <div className="hidden md:flex items-center">
            <Select
              value={selectedRegion}
              onValueChange={(value) => setSelectedRegion(value as Region | 'all')}
            >
              <SelectTrigger className="w-[140px] h-9 gap-1 border-border/60">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleSearch} className="hidden sm:flex items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 w-[180px] lg:w-[240px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          
          {/* Desktop Create Actions */}
          {isAuthenticated && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden xl:flex gap-2"
                onClick={() => navigate({ to: '/my-drafts' })}
              >
                <FileText className="h-4 w-4" />
                My Drafts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden xl:flex gap-2"
                onClick={() => navigate({ to: '/manage-bikes' })}
              >
                <Wrench className="h-4 w-4" />
                Manage Bikes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden xl:flex gap-2"
                onClick={() => navigate({ to: '/create-article' })}
              >
                <PlusCircle className="h-4 w-4" />
                Create Article
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden xl:flex gap-2"
                onClick={() => navigate({ to: '/create-review' })}
              >
                <PlusCircle className="h-4 w-4" />
                Create Review
              </Button>
            </>
          )}
          
          <ThemeToggle />
          <AuthButton />
          
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {/* Mobile Region Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Region</label>
                  <Select
                    value={selectedRegion}
                    onValueChange={(value) => setSelectedRegion(value as Region | 'all')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={cat.path || (cat.id === 'comparisons' ? '/compare' : '/category/$categoryId')}
                    params={cat.path || cat.id === 'comparisons' ? undefined : { categoryId: cat.id }}
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat.label}
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <>
                    <Separator className="my-2" />
                    <Link
                      to="/my-drafts"
                      className="text-lg font-medium hover:text-primary transition-colors flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FileText className="h-5 w-5" />
                      My Drafts
                    </Link>
                    <Link
                      to="/manage-bikes"
                      className="text-lg font-medium hover:text-primary transition-colors flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Wrench className="h-5 w-5" />
                      Manage Bikes
                    </Link>
                    <Link
                      to="/create-article"
                      className="text-lg font-medium hover:text-primary transition-colors flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PlusCircle className="h-5 w-5" />
                      Create Article
                    </Link>
                    <Link
                      to="/create-review"
                      className="text-lg font-medium hover:text-primary transition-colors flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PlusCircle className="h-5 w-5" />
                      Create Review
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
