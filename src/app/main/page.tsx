'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { fetchPublicProducts } from '@/service/customer/productService';
import { fetchAllCategories } from '@/service/categoryService';

import { ProductListDTO } from '@/types/seller/product/product';
import { Category } from '@/types/common/category';

import Navbar from '@/components/customer/common/Navbar';
import ChatbotFloatingButton from '@/components/customer/common/ChatbotFloatingButton';
import ProductCard from '@/components/customer/product/ProductCard';
import BannerCarousel from '@/components/main/BannerCarousel';
import WeeklyAuctionSlider from '@/components/main/WeeklyAuctionSlider';
import PopularProductsGrid from '@/components/main/PopularProductsGrid';
import BottomBannerCarousel from '@/components/main/BottomBannerCarousel';

const ITEMS_PER_PAGE = 20;

export default function CustomerHomePage() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const categoryFromUrl = searchParams.get('category');
    const keywordFromUrl = searchParams.get('keyword') || '';

    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [keyword, setKeyword] = useState<string>('');
    const [products, setProducts] = useState<ProductListDTO[]>([]);
    const [page, setPage] = useState(1);
    const [showLoadMore, setShowLoadMore] = useState(true);
    const [categoryMap, setCategoryMap] = useState<Record<number, Category>>({});

    const showMainTopBanners = pathname === '/main' && !categoryFromUrl && !keywordFromUrl;

    useEffect(() => {
        fetchAllCategories().then((categories) => {
            const map = Object.fromEntries(categories.map((c) => [c.id, c]));
            setCategoryMap(map);
        });
    }, []);

    useEffect(() => {
        setCategoryId(categoryFromUrl ? Number(categoryFromUrl) : null);
        setKeyword(keywordFromUrl);
        setPage(1);
    }, [categoryFromUrl, keywordFromUrl]);

    useEffect(() => {
        fetchPublicProducts(categoryId, 1, ITEMS_PER_PAGE, keyword).then((initial) => {
            setProducts(initial);
            setShowLoadMore(initial.length === ITEMS_PER_PAGE);
        });
    }, [categoryId, keyword]);

    const loadMore = async () => {
        const nextPage = page + 1;
        const newProducts = await fetchPublicProducts(categoryId, nextPage, ITEMS_PER_PAGE, keyword);
        setProducts((prev) => [...prev, ...newProducts]);
        setPage(nextPage);
        setShowLoadMore(newProducts.length === ITEMS_PER_PAGE);
    };

    function getTopCategoryName(id: number | null): string {
        if (!id || !categoryMap[id]) return '전체상품';
        let current = categoryMap[id];
        while (current.parentId && categoryMap[current.parentId]) {
            current = categoryMap[current.parentId];
        }
        return current.name;
    }

    return (
        <div>
            <Navbar
                onCategorySelect={(id) => {
                    const query = new URLSearchParams();
                    if (id !== null) query.set('category', String(id));
                    if (keyword) query.set('keyword', keyword);
                    window.location.href = `/main?${query.toString()}`;
                }}
                onSearch={(newKeyword) => {
                    const query = new URLSearchParams();
                    if (categoryId !== null) query.set('category', String(categoryId));
                    if (newKeyword) query.set('keyword', newKeyword);
                    window.location.href = `/main?${query.toString()}`;
                }}
            />

            {/* ✅ 상단 배너 - 검색/카테고리 없을 때만 */}
            {showMainTopBanners && (
                <div className="mt-8 mb-8 w-full max-w-none px-0">
                    <BannerCarousel />
                </div>
            )}

            {/* ✅ 카테고리 없을 때만 옥션 배너 */}
            {!categoryId && (
                <div className="mt-1 mb-1 sm:mt-10 sm:mb-8">
                    <WeeklyAuctionSlider />
                </div>
            )}

            <PopularProductsGrid />

            {/* ✅ 하단 배너 - 상품 목록 위로 이동 */}
            <div className="mt-20 mb-10">
                <BottomBannerCarousel images={['/images/banner4.png', '/images/banner5.png']} />
            </div>

            {/* ✅ 상품 목록 */}
            <section className="max-w-screen-xl mx-auto px-1 py-30 sm:mt-10 sm:mb-8">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {getTopCategoryName(categoryId)}
                    </h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                    다양한 상품을 확인하고 원하는 제품을 찾아보세요.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {products.map((p, index) => (
                        <ProductCard key={`product-${p.id}-${p.imageThumbnailUrl}-${index}`} {...p} />
                    ))}
                </div>

                {showLoadMore && (
                    <div className="text-center mt-6">
                        <button
                            onClick={loadMore}
                            className="px-6 py-2 text-sm bg-white hover:bg-gray-100 text-gray-800 rounded-lg border border-gray-300"
                        >
                            더보기
                        </button>
                    </div>
                )}
            </section>

            {/* ✅ 중간 배너 - 맨 아래로 위치 변경 */}
            {showMainTopBanners && (
                <div className="max-w-screen-xl mx-auto px-4 my-10">
                    <img
                        src="/images/banner-bottom.jpg"
                        alt="프로모션 배너"
                        className="w-full rounded-xl shadow-md object-cover"
                    />
                </div>
            )}

            <ChatbotFloatingButton />
        </div>
    );
}
