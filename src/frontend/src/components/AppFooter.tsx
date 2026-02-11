import { SiX, SiFacebook, SiInstagram, SiYoutube } from 'react-icons/si';

export default function AppFooter() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' ? window.location.hostname : 'revnation';

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-4">About RevNation</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted source for global motorcycle news, in-depth reviews, and expert analysis.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/category/news" className="hover:text-foreground transition-colors">News</a></li>
              <li><a href="/category/reviews" className="hover:text-foreground transition-colors">Reviews</a></li>
              <li><a href="/category/electric" className="hover:text-foreground transition-colors">Electric</a></li>
              <li><a href="/category/racing" className="hover:text-foreground transition-colors">Racing</a></li>
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h3 className="font-semibold mb-4">Regions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Asia</li>
              <li>Europe</li>
              <li>USA</li>
              <li>Middle East</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiX className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiYoutube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} RevNation. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(appIdentifier)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
