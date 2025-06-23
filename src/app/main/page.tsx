'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchPublicProducts, fetchPopularProducts } from '@/service/customer/productService';
import { ProductListDTO } from '@/types/seller/product/product';
import Navbar from '@/components/customer/common/Navbar';
import ChatbotFloatingButton from '@/components/customer/common/ChatbotFloatingButton';
import ProductCard from '@/components/customer/product/ProductCard';

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

    // ✅ URL 파라미터를 상태로 반영
    useEffect(() => {
        setCategoryId(categoryFromUrl ? Number(categoryFromUrl) : null);
        setKeyword(keywordFromUrl);
        setPage(1);
    }, [categoryFromUrl, keywordFromUrl]);

    // ✅ 인기 상품 불러오기
    useEffect(() => {
        fetchPopularProducts().then(setPopularProducts);
    }, []);

    // ✅ categoryId 또는 keyword가 바뀌었을 때 상품 초기화 & 새로 불러오기
    useEffect(() => {
        setProducts([]);
        fetchPublicProducts(categoryId, 1, ITEMS_PER_PAGE, keyword).then(setProducts);
    }, [categoryId, keyword]);

    // ✅ 페이지가 증가할 때 다음 페이지 상품 추가
    useEffect(() => {
        if (page === 1) return;

        fetchPublicProducts(categoryId, page, ITEMS_PER_PAGE, keyword).then((newProducts) => {
            setProducts((prev) => [...prev, ...newProducts]);
        });
    }, [page]);

    // ✅ 무한 스크롤을 위한 IntersectionObserver
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

            {/* 🔥 인기 상품 */}
            {popularProducts.length > 0 && (
                <div className="px-4 mb-8">
                    <h2 className="text-lg font-bold mb-3">인기 상품 🔥</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {popularProducts.map((p) => (
                            <ProductCard key={p.id} {...p} />
                        ))}
                    </div>
                </div>
            )}

            {/* 📦 상품 목록 */}
            <div className="px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((p) => (
                    <ProductCard key={p.id} {...p} />
                ))}
                <div ref={loader} className="h-10 col-span-full" />
            </div>

            <ChatbotFloatingButton />
        </div>
    );
}
