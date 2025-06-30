import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/customer/authStore';
import { useGlobalDialog } from '@/app/context/dialogContext';


export default function useRequireAuth(message = '로그인이 필요한 서비스 입니다.') {
  const hydrated    = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  
  const router = useRouter();
  const pathname = usePathname();
  const { show } = useGlobalDialog();
  const checkedRef = useRef(false);
  
 useEffect(() => {
    // 아직 스토어가 복원되지 않았으면 아무것도 하지 않음
    if (!hydrated || checkedRef.current) return;

    // 토큰이 없고, 지금 위치가 로그인 페이지가 아니라면
    if (!accessToken && !pathname.startsWith('/customer/member/login')) {
      (async () => {
        checkedRef.current = true;         // 한 번만 실행
        await show(message);

        router.replace(
          `/customer/member/login?redirectTo=${encodeURIComponent(pathname)}`,
        );
      })();
    }
  }, [hydrated, accessToken, pathname, router, show, message]);


  return accessToken;
}
