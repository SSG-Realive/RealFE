'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchPublicProducts } from '@/service/customer/productService';
import { ProductListDTO } from '@/types/seller/product/product';
import Navbar from '@/components/customer/Navbar';
import ChatbotFloatingButton from '@/components/customer/ChatbotFloatingButton';
import ProductCard from '@/components/customer/ProductCard';

const categories = [
    { id: null, name: '전체' },
    { id: 1, name: '가구' },
    { id: 2, name: '수납/정리' },
    { id: 3, name: '인테리어 소품' },
    { id: 4, name: '유아/아동' },
];

const ITEMS_PER_PAGE = 20;

export default function CustomerHomePage() {
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [products, setProducts] = useState<ProductListDTO[]>([]);
    const [page, setPage] = useState(1);
    const loader = useRef<HTMLDivElement | null>(null);

    // 상품 불러오기
    const loadMore = async () => {
        const newProducts = await fetchPublicProducts(categoryId, page, ITEMS_PER_PAGE, searchKeyword);
        setProducts((prev) => [...prev, ...newProducts]);
    };

    // 무한 스크롤
    useEffect(() => {
        if (!loader.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setPage((prev) => prev + 1);
            }
        }, { rootMargin: '100px' });

        observer.observe(loader.current);
        return () => {
            if (loader.current) observer.unobserve(loader.current);
        };
    }, []);

    // 페이지 변경 시 상품 추가 로딩
    useEffect(() => {
        loadMore();
    }, [page]);

    // 카테고리 변경 시 초기화
    useEffect(() => {
        setPage(1);
        fetchPublicProducts(categoryId, 1, ITEMS_PER_PAGE, searchKeyword).then((initialProducts) => {
            setProducts(initialProducts);
        });
    }, [categoryId]);

    // 검색 실행
    const handleSearch = async () => {
        setPage(1);
        const results = await fetchPublicProducts(categoryId, 1, ITEMS_PER_PAGE, searchKeyword);
        setProducts(results);
    };

    return (
        <div>
            <Navbar />

            {/* 🔍 검색창 */}
            <div className="px-4 py-4 flex gap-2 justify-center">
                <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="상품명을 검색하세요"
                    className="border px-3 py-2 w-full max-w-sm rounded"
                />
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    검색
                </button>
            </div>

            {/* 🔽 카테고리 필터 */}
            <div className="flex gap-3 overflow-x-auto mb-6 px-4 py-2">
                {categories.map(({ id, name }) => (
                    <button
                        key={id ?? 'all'}
                        onClick={() => {
                            setCategoryId(id);
                            setProducts([]);
                            setPage(1);
                        }}
                        className={`px-4 py-1 rounded-full border text-sm whitespace-nowrap ${
                            categoryId === id
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-gray-700 border-gray-300'
                        }`}
                    >
                        {name}
                    </button>
                ))}
            </div>

            {/* 🔽 상품 목록 */}
            <div className="px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((p) => (
                    <ProductCard key={p.id} {...p} />
                ))}
                <div ref={loader} className="h-10 col-span-full"></div>
            </div>

            <ChatbotFloatingButton />
        </div>
    );
}
