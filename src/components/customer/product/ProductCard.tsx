    'use client';

    import { useState } from 'react';
    import Link from 'next/link';
    import { ProductListDTO } from '@/types/seller/product/product';
    import { FaHeart, FaRegHeart } from 'react-icons/fa'; // 엔틱 느낌 하트 아이콘

    export default function ProductCard({
                                            id,
                                            name,
                                            price,
                                            imageThumbnailUrl,
                                        }: ProductListDTO) {
        const [hovered, setHovered] = useState(false);
        const [liked, setLiked] = useState(false); // 찜 상태

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

                        {/* 💖 찜 버튼 (hover 시만 표시) */}
                        {hovered && (
                            <button
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                  bg-white/60 backdrop-blur-sm text-red-500 p-3 rounded-full shadow-lg hover:bg-white/80 transition z-10"
                                onClick={(e) => {
                                    e.preventDefault(); // 링크 이동 방지
                                    setLiked((prev) => !prev);
                                }}
                            >
                                {liked ? (
                                    <FaHeart className="w-5 h-5 text-red-500" />
                                ) : (
                                    <FaRegHeart className="w-5 h-5 text-gray-400" />
                                )}
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
