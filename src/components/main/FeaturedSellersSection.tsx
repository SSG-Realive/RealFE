'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import { Heart, HeartIcon, ShoppingCart } from 'lucide-react';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { fetchFeaturedSellersWithProducts } from "@/service/customer/productService";
import { toggleWishlist } from "@/service/customer/wishlistService";
import { addToCart } from '@/service/customer/cartService';
import { FeaturedSellerWithProducts } from "@/types/product";
import ProductImage from "@/components/ProductImage";
import { useAuthStore } from '@/store/customer/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useGlobalDialog } from '@/app/context/dialogContext';

export default function FeaturedSellersSection() {
    const [featured, setFeatured] = useState<FeaturedSellerWithProducts[]>([]);
    const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const pathname = usePathname();
    const { show } = useGlobalDialog();

    const withAuth = async (action: () => Promise<void>) => {
        if (!useAuthStore.getState().accessToken) {
            await show('로그인이 필요한 서비스입니다.');
            router.push(`/customer/member/login?redirectTo=${encodeURIComponent(pathname)}`);
            return;
        }
        await action();
    };

    useEffect(() => {
        fetchFeaturedSellersWithProducts()
            .then(data => {
                const valid = data.filter(seller => seller.products.length > 0);
                const shuffled = valid.sort(() => 0.5 - Math.random());
                const picked = shuffled.slice(0, 3);
                setFeatured(picked);

                const map: Record<number, boolean> = {};
                picked.forEach(seller => {
                    seller.products.forEach(p => {
                        map[p.productId] = p.isWished ?? false;
                    });
                });
                setLikedMap(map);

                setLoading(false);
            })
            .catch(err => {
                console.error('추천 섹션 로드 실패', err);
                setError(err.message ?? '알 수 없는 에러');
                setLoading(false);
            });
    }, []);

    const handleToggleWishlist = async (productId: number) => {
        const current = likedMap[productId] ?? false;
        setLikedMap(prev => ({ ...prev, [productId]: !current }));
        try {
            const result = await toggleWishlist({ productId });
            setLikedMap(prev => ({ ...prev, [productId]: result }));
        } catch (error) {
            console.error('찜 실패:', error);
            setLikedMap(prev => ({ ...prev, [productId]: current }));
            alert('찜 처리 중 오류가 발생했습니다.');
        }
    };

    const handleAddToCart = async (productId: number) => {
        await withAuth(() =>
            addToCart({ productId, quantity: 1 }).then(() =>
                show('장바구니에 담았습니다.')
            )
        );
    };

    if (loading) {
        return <div className="text-center py-8">로딩 중...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">추천 섹션을 불러올 수 없습니다: {error}</div>;
    }

    return (
        <section className="my-10 px-4">
            <style>{`
        .slick-dots {
          display: flex !important;
          justify-content: center;
          margin-top: 12px;
        }
        .slick-dots li {
          margin: 0 4px;
        }
        .slick-dots li button:before {
          color: #bbb;
          font-size: 10px;
        }
        .slick-dots li.slick-active button:before {
          color: #111;
        }
      `}</style>

            <div className="max-w-7xl mx-auto p-6">
                <h2 className="text-xl font-light text-gray-800 text-center mb-6">
                    오늘의 판매자 상품
                </h2>

                <div className="space-y-10">
                    {featured.map((seller) => (
                        <div key={seller.sellerId}>
                            <h3 className="text-lg font-light text-gray-700 mb-4 text-center">
                                {seller.sellerName}
                            </h3>

                            <Slider
                                dots={true}
                                infinite={true}
                                speed={500}
                                slidesToShow={3}
                                slidesToScroll={1}
                                autoplay={true}
                                autoplaySpeed={3000}
                                pauseOnHover={true}
                                responsive={[
                                    { breakpoint: 1024, settings: { slidesToShow: 2 } },
                                    { breakpoint: 640, settings: { slidesToShow: 1 } },
                                ]}
                            >
                                {seller.products.map((product) => (
                                    <div key={product.productId} className="px-2">
                                        <Link href={`/main/products/${product.productId}`}>
                                            <div className="w-full max-w-xs mx-auto text-left cursor-pointer group">
                                                {/* 이미지 */}
                                                <div className="relative aspect-[4/3] mb-2">
                                                    <ProductImage
                                                        src={product.imageThumbnailUrl}
                                                        alt={product.name}
                                                        className="absolute top-0 left-0 w-full h-full object-cover rounded-lg shadow"
                                                    />

                                                    {/* 장바구니 버튼 (좌측 상단) */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleAddToCart(product.productId);
                                                        }}
                                                        className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow hover:bg-white z-10"
                                                        type="button"
                                                        title="장바구니 담기"
                                                    >
                                                        <ShoppingCart size={18} className="text-gray-600" />
                                                    </button>

                                                    {/* 찜 버튼 (우측 상단) */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleToggleWishlist(product.productId);
                                                        }}
                                                        className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow hover:bg-white z-10"
                                                        type="button"
                                                        title={likedMap[product.productId] ? '찜 취소' : '찜하기'}
                                                    >
                                                        {likedMap[product.productId] ? (
                                                            <Heart size={18} className="text-red-500 fill-red-500" />
                                                        ) : (
                                                            <HeartIcon size={18} className="text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>

                                                {/* 텍스트 */}
                                                <div className="mt-4 text-black">
                                                    <p className="text-base font-light truncate">{product.name}</p>
                                                    <p className="text-sm font-light text-gray-800 mt-1">
                                                        {product.price.toLocaleString()}
                                                        <span className="text-xs align-middle ml-1">원</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
