import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile, useGetCallerUserRole } from './useQueries';

export function useCurrentUser() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: userRole } = useGetCallerUserRole();

  const isAuthenticated = !!identity;
  const isAdmin = userRole === 'admin';

  return {
    isAuthenticated,
    userProfile,
    profileLoading,
    isFetched,
    isAdmin,
  };
}
