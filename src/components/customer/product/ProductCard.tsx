'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProductListDTO } from '@/types/seller/product/product';
import { Heart } from 'lucide-react'; // lucide-react 아이콘 사용

interface Props extends ProductListDTO {
    onToggle?: (productId: number) => void;
}

export default function ProductCard({
                                        id,
                                        name,
                                        price,
                                        imageThumbnailUrl,
                                        isWished,
                                        onToggle,
                                    }: Props) {
    const [hovered, setHovered] = useState(false);
    const [liked, setLiked] = useState(isWished);

    const handleToggleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        setLiked((prev) => !prev);
        onToggle?.(id);
    };

    return (
        <Link href={`/main/products/${id}`}>
            <div
                className="relative bg-[#f9f9f7] rounded-2xl overflow-hidden p-3 hover:shadow-md transition"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <div className="relative">
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

                    {hovered && (
                        <button
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                bg-white/60 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white/80 transition z-10"
                            onClick={handleToggleLike}
                        >
                            <Heart
                                size={20}
                                stroke={liked ? 'red' : 'gray'}
                                fill={liked ? 'red' : 'none'}
                            />
                        </button>
                    )}
                </div>

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
