'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/customer/Navbar';
import { fetchProductDetail } from '@/service/customer/productService';
import { toggleWishlist } from '@/service/customer/wishlistService';
import { ProductDetail } from '@/types/seller/product/product';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isWished, setIsWished] = useState<boolean>(false);

    // 상품 상세 정보 가져오기
    useEffect(() => {
        if (id) {
            fetchProductDetail(Number(id))
                .then((data) => {
                    setProduct(data);
                    // 이 시점에 isWished 조회 API 있으면 여기서 setIsWished 호출 가능
                })
                .catch(() => setError('상품을 불러오지 못했습니다.'));
        }
    }, [id]);

    // 찜 토글 핸들러
    const handleToggleWishlist = async () => {
        if (!product) return;
        const result = await toggleWishlist({ productId: product.id });
        setIsWished(result); // 서버에서 true/false 반환
    };

    if (error) return <div className="text-red-500">{error}</div>;
    if (!product) return <div>로딩 중...</div>;

    return (
        <div>
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

                <p className="text-green-600 font-semibold mb-2">
                    {product.price.toLocaleString()}원
                </p>

                {/* ❤️ 찜 버튼 */}
                <button
                    onClick={handleToggleWishlist}
                    className="text-2xl mb-4"
                    aria-label="찜하기 버튼"
                >
                    {isWished ? '❤️' : '🤍'}
                </button>

                <img
                    src={product.imageThumbnailUrl}
                    alt={product.name}
                    className="w-full h-64 object-cover mb-6 rounded"
                />

                <p className="text-gray-700 whitespace-pre-line mb-4">{product.description}</p>

                <div className="text-sm text-gray-600">
                    <p>재고: {product.stock}개</p>
                    <p>상태: {product.status}</p>
                    {product.width && product.depth && product.height && (
                        <p>
                            사이즈: {product.width} x {product.depth} x {product.height} cm
                        </p>
                    )}
                    {product.categoryName && <p>카테고리: {product.categoryName}</p>}
                    {product.seller && <p>판매자: {product.seller}</p>}
                </div>
            </div>
        </div>
    );
}
