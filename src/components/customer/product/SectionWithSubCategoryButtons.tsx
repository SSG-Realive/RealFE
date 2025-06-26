'use client';

import { useEffect, useState } from 'react';
import { Category } from '@/types/common/category';
import { ProductListDTO } from '@/types/seller/product/product';
import { fetchPublicProducts } from '@/service/customer/productService';
import { fetchAllCategories } from '@/service/categoryService';
import ProductCard from './ProductCard';

interface Props {
    title: string;
    categoryId: number; // 1차 카테고리 ID
    limit: number;
}

export default function SectionWithSubCategoryButtons({ title, categoryId, limit }: Props) {
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
    const [products, setProducts] = useState<ProductListDTO[]>([]);

    useEffect(() => {
        fetchAllCategories().then((all) => {
            const filtered = all.filter((c) => c.parentId === categoryId);
            setSubCategories(filtered);
            setSelectedSubId(null); // 처음에는 전체 보기
        });
    }, [categoryId]);

    useEffect(() => {
        const targetId = selectedSubId ?? categoryId; // 선택된 2차가 없으면 1차 카테고리로 전체 조회
        fetchPublicProducts(targetId, 1, limit).then(setProducts);
    }, [selectedSubId, categoryId, limit]);

    return (
        <div className="mb-12 max-w-screen-xl mx-auto px-2 sm:px-0">
            {/* 🔹 타이틀과 버튼을 같은 줄에 배치 */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-start gap-2 mb-4 overflow-x-auto no-scrollbar">
                <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">{title}</h2>
                <button
                    onClick={() => setSelectedSubId(null)}
                    className={`text-sm whitespace-nowrap transition ${
                        selectedSubId === null
                            ? 'text-black font-semibold underline'
                            : 'text-gray-500 hover:text-black'
                    }`}
                >
                    전체
                </button>
                {subCategories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedSubId(cat.id)}
                        className={`text-sm whitespace-nowrap transition ${
                            selectedSubId === cat.id
                                ? 'text-black font-semibold underline'
                                : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* 🔹 상품 목록 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.map((p) => (
                    <ProductCard key={p.id} {...p} />
                ))}
            </div>
        </div>
    );
}
