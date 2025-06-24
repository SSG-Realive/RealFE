'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchPublicProducts, fetchPopularProducts } from '@/service/customer/productService';
import { toggleWishlist } from '@/service/customer/wishlistService';
import { ProductListDTO } from '@/types/seller/product/product';
import Navbar from '@/components/customer/common/Navbar';
import ChatbotFloatingButton from '@/components/customer/common/ChatbotFloatingButton';
import ProductCard from '@/components/customer/product/ProductCard';
import BannerCarousel from '@/components/main/BannerCarousel';
import WeeklyAuctionSlider from '@/components/main/WeeklyAuctionSlider';

const ITEMS_PER_PAGE = 20;

export default function CustomerHomePage() {
    const searchParams = useSearchParams();
    const categoryFromUrl = searchParams.get('category');
    const keywordFromUrl = searchParams.get('keyword') || '';

    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [keyword, setKeyword] = useState<string>('');
    const [products, setProducts] = useState<ProductListDTO[]>([]);
    const [popularProducts, setPopularProducts] = useState<ProductListDTO[]>([]);
    const [page, setPage] = useState(1);
    const loader = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setCategoryId(categoryFromUrl ? Number(categoryFromUrl) : null);
        setKeyword(keywordFromUrl);
        setPage(1);
    }, [categoryFromUrl, keywordFromUrl]);

    useEffect(() => {
        fetchPopularProducts().then(setPopularProducts);
    }, []);

    useEffect(() => {
        setProducts([]);
        fetchPublicProducts(categoryId, 1, ITEMS_PER_PAGE, keyword).then(setProducts);
    }, [categoryId, keyword]);

    useEffect(() => {
        if (page === 1) return;
        fetchPublicProducts(categoryId, page, ITEMS_PER_PAGE, keyword).then((newProducts) => {
            setProducts((prev) => [...prev, ...newProducts]);
        });
    }, [page]);

    useEffect(() => {
        if (!loader.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setPage((prev) => prev + 1);
                }
            },
            { rootMargin: '100px' }
        );
        observer.observe(loader.current);
        return () => {
            if (loader.current) observer.unobserve(loader.current);
        };
    }, []);

    const handleToggleWishlist = async (productId: number) => {
        try {
            const newStatus = await toggleWishlist({ productId });
            setProducts((prev) =>
                prev.map((item) => (item.id === productId ? { ...item, isWished: newStatus } : item))
            );
            setPopularProducts((prev) =>
                prev.map((item) => (item.id === productId ? { ...item, isWished: newStatus } : item))
            );
        } catch {
            window.location.href = '/login';
        }
    };

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

            {!categoryId && !keyword && (
                <section className="bg-white py-0">
                    <BannerCarousel />
                </section>
            )}

            <section className="bg-[#f8f5f2] py-10">
                <div className="max-w-6xl mx-auto px-4">
                    <WeeklyAuctionSlider />
                </div>
            </section>

            {popularProducts.length > 0 && (
                <section className="bg-gray-50 py-12">
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-lg font-bold mb-3">인기 상품</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {popularProducts.map((p, index) => (
                                <ProductCard key={`popular-${p.id}-${index}`} {...p} onToggle={handleToggleWishlist} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="bg-[#f9f9f7] px-6 py-10 mx-4 mt-12 rounded-[2rem] shadow-inner">
                <h2 className="text-lg font-semibold mb-6 text-black">전체 상품</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map((p, index) => (
                        <ProductCard key={`product-${p.id}-${index}`} {...p} onToggle={handleToggleWishlist} />
                    ))}
                    <div ref={loader} className="h-10 col-span-full" />
                </div>
            </section>

            <ChatbotFloatingButton />
        </div>
    );
}
