import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from './useQueries';

export function useCurrentUser() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  return {
    isAuthenticated,
    userProfile,
    profileLoading,
    isFetched,
    isAdmin: isAdmin || false,
  };
}
