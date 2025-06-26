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
            setSelectedSubId(filtered[0]?.id || null); // 첫 번째 자동 선택
        });
    }, [categoryId]);

    useEffect(() => {
        if (selectedSubId !== null) {
            fetchPublicProducts(selectedSubId, 1, limit).then(setProducts);
        }
    }, [selectedSubId]);

    return (
        <div className="mb-12 max-w-screen-xl mx-auto px-2 sm:px-0">
            {/* 🔹 타이틀과 버튼을 같은 줄에 배치 */}
            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 mr-4 whitespace-nowrap">{title}</h2>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap overflow-x-auto">
                    {subCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedSubId(cat.id)}
                            className={`px-3 py-1 rounded-full border text-sm whitespace-nowrap transition ${
                                selectedSubId === cat.id
                                    ? 'bg-black text-white'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.map((p) => (
                    <ProductCard key={p.id} {...p} />
                ))}
            </div>
        </div>
    );
}
