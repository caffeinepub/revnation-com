import { Outlet } from '@tanstack/react-router';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import ProfileSetupDialog from './ProfileSetupDialog';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
      <ProfileSetupDialog />
    </div>
  );
}
