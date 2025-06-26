'use client';

import { useEffect, useState } from 'react';
import { ProductListDTO } from '@/types/seller/product/product';
import { Category } from '@/types/common/category';
import { fetchPublicProducts } from '@/service/customer/productService';
import ProductCard from './ProductCard';

interface Props {
    parentCategory: Category;
    subCategories: Category[];
}

export default function SectionWithSubFilters({ parentCategory, subCategories }: Props) {
    const [selectedId, setSelectedId] = useState<number | null>(subCategories[0]?.id ?? null);
    const [products, setProducts] = useState<ProductListDTO[]>([]);

    useEffect(() => {
        if (selectedId !== null) {
            fetchPublicProducts(selectedId, 1, 10, '').then(setProducts);
        }
    }, [selectedId]);

    return (
        <section className="max-w-screen-xl mx-auto px-4 py-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{parentCategory.name}</h2>
            <div className="flex flex-wrap gap-2 mb-6">
                {subCategories.map((sub) => (
                    <button
                        key={sub.id}
                        onClick={() => setSelectedId(sub.id)}
                        className={`px-4 py-1 border rounded-full text-sm ${
                            selectedId === sub.id
                                ? 'bg-black text-white'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        {sub.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </section>
    );
}
