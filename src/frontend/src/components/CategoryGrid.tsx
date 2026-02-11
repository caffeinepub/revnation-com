import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Newspaper, Star, Zap, Flag, Lightbulb, Scale, BookOpen } from 'lucide-react';

const categories = [
  { id: 'news', label: 'News', icon: Newspaper, description: 'Latest updates and launches' },
  { id: 'reviews', label: 'Reviews', icon: Star, description: 'In-depth bike analysis' },
  { id: 'electric', label: 'Electric', icon: Zap, description: 'EV bikes and technology' },
  { id: 'racing', label: 'Racing', icon: Flag, description: 'Track news and results' },
  { id: 'concepts', label: 'Concepts', icon: Lightbulb, description: 'Future designs' },
  { id: 'comparisons', label: 'Compare', icon: Scale, description: 'Bike vs bike' },
  { id: 'buyingGuides', label: 'Buying Guides', icon: BookOpen, description: 'Expert advice' },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <Link
            key={category.id}
            to={category.id === 'comparisons' ? '/compare' : '/category/$categoryId'}
            params={category.id === 'comparisons' ? undefined : { categoryId: category.id }}
          >
            <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{category.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
