import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/customer/authStore';

export default function useRequireAuth() {
  // 정확한 키(accessToken)로 가져오기
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      const currentPath = window.location.pathname;
      router.replace(`/customer/member/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [accessToken, router]);

  return accessToken;
}
