import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, MemberProfile } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth/provider';

const PROFILE_KEY = ['member', 'profile'] as const;

export function useMemberProfile() {
  const { isLoggedIn } = useAuth();

  const { data: profile, isLoading } = useQuery<MemberProfile | null>({
    queryKey: PROFILE_KEY,
    queryFn: getMyProfile,
    enabled: isLoggedIn,
    staleTime: 5 * 60 * 1000,
  });

  return { profile: profile ?? null, isLoading };
}

export function useInvalidateProfile() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: PROFILE_KEY });
}
