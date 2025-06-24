'use client';

import { ProductListDTO } from '@/types/seller/product/product';
import Link from 'next/link';

export default function ProductCard({
                                        id,
                                        name,
                                        price,
                                        imageThumbnailUrl,
                                    }: ProductListDTO) {
    return (
        <Link href={`/main/products/${id}`}>
            <div className="bg-[#f9f9f7] rounded-2xl overflow-hidden p-3 hover:shadow-md transition">
                {imageThumbnailUrl ? (
                    <img
                        src={imageThumbnailUrl}
                        alt={name}
                        className="w-full h-48 object-cover rounded-xl"
                    />
                ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-500 rounded-xl">
                        이미지 없음
                    </div>
                )}
                <div className="mt-3 text-black">
                    <p className="text-sm font-light truncate">{name}</p>
                    <p className="text-sm font-light">
                        {price.toLocaleString()}
                        <span className="text-xs align-middle ml-0.5">원</span>
                    </p>
                </div>
            </div>
        </Link>
    );
}
