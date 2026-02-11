import { useCurrentUser } from '../hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface RequireAuthActionProps {
  children: React.ReactNode;
  action: string;
}

export default function RequireAuthAction({ children, action }: RequireAuthActionProps) {
  const { isAuthenticated } = useCurrentUser();
  const { login } = useInternetIdentity();

  if (!isAuthenticated) {
    return (
      <div className="border rounded-lg p-6 text-center space-y-4">
        <p className="text-muted-foreground">Please sign in to {action}</p>
        <Button onClick={login} className="gap-2">
          <LogIn className="h-4 w-4" />
          Sign In
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
