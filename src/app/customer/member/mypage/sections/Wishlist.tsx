'use client';

import { useEffect, useState } from 'react';
import { fetchWishlist } from '@/service/wishlistService';
import { ProductListDTO } from '@/types/product';
import MypageCard from '../MypageCard';

export default function Wishlist() {
    const [products, setProducts] = useState<ProductListDTO[]>([]);

    useEffect(() => {
        fetchWishlist().then(setProducts);
    }, []);

    return (
        <MypageCard title="찜 목록">
            <ul className="grid grid-cols-2 gap-4">
                {products.map((p) => (
                    <li key={p.productId} className="border p-2 rounded">
                        <img src={p.thumbnailUrl} alt={p.name} />
                        <div className="mt-1 text-sm">{p.name}</div>
                    </li>
                ))}
            </ul>
        </MypageCard>
    );
}