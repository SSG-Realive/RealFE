'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import { Heart, HeartIcon, ShoppingCart } from 'lucide-react';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { fetchFeaturedSellersWithProducts } from '@/service/customer/productService';
import { toggleWishlist } from '@/service/customer/wishlistService';
import { addToCart } from '@/service/customer/cartService';
import { FeaturedSellerWithProducts } from '@/types/product';
import ProductImage from '@/components/ProductImage';
import { useAuthStore } from '@/store/customer/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useGlobalDialog } from '@/app/context/dialogContext';

export default function FeaturedSellersSection() {
    const [featured, setFeatured] = useState<FeaturedSellerWithProducts[]>([]);
    const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(true);
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
            .then((data) => {
                const valid = data.filter((s) => s.products.length > 0);
                const picked = valid.sort(() => 0.5 - Math.random()).slice(0, 3);
                setFeatured(picked);

                const map: Record<number, boolean> = {};
                picked.forEach((s) => {
                    s.products.forEach((p) => {
                        map[p.productId] = p.isWished ?? false;
                    });
                });
                setLikedMap(map);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message ?? '알 수 없는 오류');
                setLoading(false);
            });
    }, []);

    const handleToggleWishlist = async (productId: number) => {
        await withAuth(async () => {
            const current = likedMap[productId] ?? false;
            setLikedMap((prev) => ({ ...prev, [productId]: !current }));
            try {
                const result = await toggleWishlist({ productId });
                setLikedMap((prev) => ({ ...prev, [productId]: result }));
                show(result ? '찜한 상품에 추가되었습니다.' : '찜 목록에서 제거되었습니다.');
            } catch (e) {
                console.error(e);
                setLikedMap((prev) => ({ ...prev, [productId]: current }));
                show('찜 처리 중 오류가 발생했습니다.');
            }
        });
    };

    const handleAddToCart = async (productId: number) => {
        await withAuth(() =>
            addToCart({ productId, quantity: 1 }).then(() =>
                show('장바구니에 담았습니다.')
            )
        );
    };

    if (loading) return <div className="text-center py-8">로딩 중...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

    return (
        <section className="max-w-screen-xl mx-auto mt-10 px-4">
            <h2 className="text-xl font-light text-gray-800 mb-1">
                오늘의 판매자 상품
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                신뢰할 수 있는 판매자의 추천 상품을 확인해보세요.
            </p>

            <div className="space-y-10">
                {featured.map((seller) => (
                    <div key={seller.sellerId}>
                        <h3 className="text-lg font-light text-gray-700 mb-4 text-center">
                            {seller.sellerName}
                        </h3>

                        <Slider
                            dots
                            infinite
                            speed={500}
                            slidesToShow={3}
                            slidesToScroll={1}
                            autoplay
                            autoplaySpeed={3000}
                            pauseOnHover
                            responsive={[
                                { breakpoint: 1024, settings: { slidesToShow: 2 } },
                                { breakpoint: 640, settings: { slidesToShow: 1 } },
                            ]}
                        >
                            {seller.products.map((product) => (
                                <div key={product.productId} className="px-2 flex">
                                    <Link href={`/main/products/${product.productId}`} className="w-full">
                                        <div className="text-left cursor-pointer group w-full">
                                            <div className="relative w-full aspect-square bg-gray-100 overflow-hidden rounded">
                                                <ProductImage
                                                    src={product.imageThumbnailUrl}
                                                    alt={product.name}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />

                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAddToCart(product.productId);
                                                    }}
                                                    className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow hover:bg-white z-10"
                                                    type="button"
                                                >
                                                    <ShoppingCart size={18} className="text-gray-600" />
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleToggleWishlist(product.productId);
                                                    }}
                                                    className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow hover:bg-white z-10"
                                                    type="button"
                                                >
                                                    {likedMap[product.productId] ? (
                                                        <Heart size={18} className="text-red-500 fill-red-500" />
                                                    ) : (
                                                        <HeartIcon size={18} className="text-gray-400" />
                                                    )}
                                                </button>
                                            </div>

                                            <div className="mt-4 text-black">
                                                <p className="text-base font-light truncate">{product.name}</p>
                                                <p className="text-sm font-light text-gray-800 mt-1 text-right">
                                                    KRW {product.price.toLocaleString()}
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
        </section>
    );
}
