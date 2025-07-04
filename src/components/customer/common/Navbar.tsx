'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { useAuthStore } from '@/store/customer/authStore';
import { useCartStore } from '@/store/customer/useCartStore';
import { fetchCartList } from '@/service/customer/cartService';
import { fetchMyProfile } from '@/service/customer/customerService';
import { requestLogout } from '@/service/customer/logoutService';
import SearchBar from './SearchBar';
import CategoryDropdown from './CategoryDropdown';
import { UserCircle, ShoppingCart, LogOut, Heart, LogIn } from 'lucide-react';
import useDialog from '@/hooks/useDialog';
import GlobalDialog from '@/components/ui/GlobalDialog';

interface NavbarProps {
    onSearch?: (keyword: string) => void;
    onCategorySelect?: (id: number) => void;
}

export default function Navbar({ onSearch, onCategorySelect }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { logout: clearAuthState } = useAuthStore();

    const { isAuthenticated, userName, setUserName } = useAuthStore();
    const { itemCount } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const { show, open, message, handleClose } = useDialog();

    const isLoginPage =
        pathname.startsWith('/customer/member/login') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/customer/member/findPassword') ||
        pathname.startsWith('/customer/socialsignup') ||
        pathname.startsWith('/customer/signup');

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (mounted && isAuthenticated()) {
            fetchCartList();
        }
    }, [mounted, isAuthenticated]);

    useEffect(() => {
        if (mounted && isAuthenticated() && !userName) {
            fetchMyProfile()
                .then((data) => setUserName(data.name))
                .catch((e) => console.error('회원 이름 조회 실패:', e));
        }
    }, [mounted, isAuthenticated, userName, setUserName]);

    const handleLogout = async () => {
        try {
            await requestLogout();
            show('로그아웃 되었습니다.');
        } catch (error) {
            console.error('Logout request failed:', error);
            show('Logout error occurred. Client will logout anyway.');
        } finally {
            clearAuthState();
            router.push('/main');
        }
    };

    const hideNavbarPaths = ['/autions', '/seller', '/admin'];

    if (hideNavbarPaths.some((path) => pathname.startsWith(path))) {
        return null;
    }

    return (
        <>
            <GlobalDialog open={open} message={message} onClose={handleClose} />
            <nav className="sticky top-0 z-[9999] w-full bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
                <div className="w-full px-4 py-3 space-y-4">

                    {/* ✅ PC 헤더 */}
                    <div className="hidden md:grid grid-cols-[auto_1fr_auto] items-center w-full">
                        <Link href="/main" className="flex-shrink-0">
                            <Image
                                src="/images/logo.png"
                                alt="Realive 로고"
                                width={120}
                                height={30}
                                className="object-contain drop-shadow-sm"
                            />
                        </Link>

                        {/* ✅ PC 검색창 (로그인 페이지에서는 숨김) */}
                        {!isLoginPage && (
                            <div className="flex justify-center">
                                <div className="w-full max-w-[900px] px-2">
                                    <SearchBar onSearch={onSearch} />
                                </div>
                            </div>
                        )}

                        {mounted && (
                            <div className="flex items-center justify-end space-x-4 text-sm text-gray-700">
                                {isAuthenticated() ? (
                                    <>
                                        <Link href="/customer/mypage" className="hover:text-gray-800" title="My Page">
                                            <UserCircle size={20} />
                                        </Link>

                                        <Link href="/customer/mypage/wishlist" className="hover:text-gray-800" title="찜한 상품">
                                            <Heart size={20} className="text-gray-500" />
                                        </Link>

                                        <Link href="/customer/cart" className="relative hover:text-gray-800" title="Cart">
                                            <ShoppingCart size={20} />
                                            {itemCount > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {itemCount}
                        </span>
                                            )}
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="hidden md:block text-xs hover:text-red-500"
                                        >
                                            LOGOUT
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            title="로그아웃"
                                            className="block md:hidden hover:text-red-500 min-w-[24px]"
                                        >
                                            <LogOut size={20} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={`/login?redirectTo=${encodeURIComponent(
                                                pathname + (searchParams?.toString() ? `?${searchParams}` : '')
                                            )}`}
                                            className="hidden md:block text-xs hover:text-blue-500"
                                        >
                                            LOGIN
                                        </Link>
                                        <Link
                                            href={`/login?redirectTo=${encodeURIComponent(
                                                pathname + (searchParams?.toString() ? `?${searchParams}` : '')
                                            )}`}
                                            title="Login"
                                            className="block md:hidden hover:text-blue-500"
                                        >
                                            <LogIn size={20} />
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ✅ PC 카테고리 */}
                    {pathname.startsWith('/main') && (
                        <div className="hidden md:block mt-4">
                            <CategoryDropdown onCategorySelect={onCategorySelect} />
                        </div>
                    )}

                    {/* ✅ 모바일 헤더 */}
                    <div className="flex items-center justify-between md:hidden">
                        <Link href="/main" className="flex items-center">
                            <Image
                                src="/images/logo.png"
                                alt="Realive 로고"
                                width={120}
                                height={30}
                                className="object-contain"
                                priority
                            />
                        </Link>

                        {mounted && (
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                                {isAuthenticated() ? (
                                    <>
                                        <Link href="/customer/mypage" title="My Page">
                                            <UserCircle size={20} />
                                        </Link>

                                        <Link href="/customer/mypage/wishlist" title="찜한 상품">
                                            <Heart size={20} className="text-gray-500" />
                                        </Link>

                                        <Link href="/customer/cart" className="relative" title="Cart">
                                            <ShoppingCart size={20} />
                                            {itemCount > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {itemCount}
                        </span>
                                            )}
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            title="로그아웃"
                                            className="block md:hidden hover:text-red-500 min-w-[24px]"
                                        >
                                            <LogOut size={20} />
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href={`/login?redirectTo=${encodeURIComponent(
                                            pathname + (searchParams?.toString() ? `?${searchParams}` : '')
                                        )}`}
                                        title="Login"
                                        className="hover:text-blue-500"
                                    >
                                        <LogIn size={20} />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ✅ 모바일 검색창 (로그인 페이지에서는 숨김) */}
                    {!isLoginPage && (
                        <div className="md:hidden">
                            <SearchBar onSearch={onSearch} />
                        </div>
                    )}

                    {/* ✅ 모바일 카테고리 */}
                    {pathname.startsWith('/main') && (
                        <div className="block md:hidden mt-4">
                            <CategoryDropdown onCategorySelect={onCategorySelect} />
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}
