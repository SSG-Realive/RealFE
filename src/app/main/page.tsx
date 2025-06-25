'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchPublicProducts } from '@/service/customer/productService';
import { ProductListDTO } from '@/types/seller/product/product';
import Navbar from '@/components/customer/common/Navbar';
import ChatbotFloatingButton from '@/components/customer/common/ChatbotFloatingButton';
import ProductCard from '@/components/customer/product/ProductCard';
import BannerCarousel from '@/components/main/BannerCarousel';
import WeeklyAuctionSlider from '@/components/main/WeeklyAuctionSlider';
import PopularProductsGrid from '@/components/main/PopularProductsGrid';
import CategoryDropdown from '@/components/customer/common/CategoryDropdown';

const ITEMS_PER_PAGE = 20; // 5열 * 5행

//
const categoryMap: Record<number, string> = {
    10: '거실 가구',
    20: '침실 가구',
    30: '주방·다이닝 가구',
    40: '서재·오피스 가구',
    50: '기타 가구',
};

export default function CustomerHomePage() {
    const searchParams = useSearchParams();
    const categoryFromUrl = searchParams.get('category');
    const keywordFromUrl = searchParams.get('keyword') || '';
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [keyword, setKeyword] = useState<string>('');
    const [products, setProducts] = useState<ProductListDTO[]>([]);

    // URL 파라미터를 상태로 반영
    useEffect(() => {
        setCategoryId(categoryFromUrl ? Number(categoryFromUrl) : null);
        setKeyword(keywordFromUrl);
    }, [categoryFromUrl, keywordFromUrl]);

    // 상품 25개만 불러오기 (무한스크롤 제거)
    useEffect(() => {
        fetchPublicProducts(categoryId, 1, ITEMS_PER_PAGE, keyword).then(setProducts);
    }, [categoryId, keyword]);

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

            {/* 배너 */}
            <div className="mt-4 mb-4 sm:mt-10 sm:mb-8">
                <BannerCarousel />
            </div>

            {/* 옥션 슬라이드 */}
            <div className="mt-1 mb-1 sm:mt-10 sm:mb-8">
                <WeeklyAuctionSlider />
            </div>

            {/* ✅ 인기 상품 */}
            <PopularProductsGrid />

            <img
                src="/images/banner-bottom.jpg"
                alt="프로모션 배너"
                className="w-full object-cover mt-25"
            />

            {/* 상품 목록 */}
            <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-30 sm:mt-10 sm:mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">전체상품</h2>
                <p className="text-sm text-gray-600 mb-6">
                    다양한 상품을 확인하고 원하는 제품을 찾아보세요.
                </p>

                <div className="mb-4">
                    <CategoryDropdown
                        isCompact={true}
                        onCategorySelect={(id) => {
                            const query = new URLSearchParams();
                            if (id !== -1) query.set('category', String(id));
                            if (keyword) query.set('keyword', keyword);
                            window.location.href = `/main?${query.toString()}`;
                        }}
                    />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 px-2 sm:px-0">
                    {products.map((p, index) => (
                        <ProductCard key={`product-${p.id}-${index}`} {...p} />
                    ))}
                </div>
            </section>

            <ChatbotFloatingButton />
        </div>
    );
}
