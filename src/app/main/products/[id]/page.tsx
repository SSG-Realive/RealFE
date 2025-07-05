// pages/main/products/[id].tsx

'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
  useParams,
  useRouter,
} from 'next/navigation';

import {
  fetchProductDetail,
  fetchRelatedProducts,
} from '@/service/customer/productService';
import { toggleWishlist } from '@/service/customer/wishlistService';
import { addToCart } from '@/service/customer/cartService';
import { fetchReviewsBySeller } from '@/service/customer/reviewService';
import { getProductQnaList } from '@/service/customer/customerQnaService';

import ReviewList from '@/components/customer/review/ReviewList';
import ProductImage from '@/components/ProductImage';
import QnaList from '@/components/customer/qna/QnaList';
import TrafficLightStatusCardforProductDetail from "@/components/seller/TrafficLightStatusCardforProductDetail";

import { ProductDetail, ProductListDTO } from '@/types/seller/product/product';
import { ReviewResponseDTO } from '@/types/customer/review/review';
import { CustomerQnaResponse, CustomerQnaListResponse } from '@/types/customer/qna/customerQnaResponse';

import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useGlobalDialog } from '@/app/context/dialogContext';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { show } = useGlobalDialog();

  const withAuth = async (action: () => Promise<void>) => {
    await action();
  };

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [related, setRelated] = useState<ProductListDTO[]>([]);
  const [reviews, setReviews] = useState<ReviewResponseDTO[]>([]);
  const [qnas, setQnas] = useState<CustomerQnaResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isWished, setIsWished] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const triggerRef = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    if (!id) return;
    const pid = Number(id);

    fetchProductDetail(pid)
        .then(setProduct)
        .catch(() => setError('상품을 불러오지 못했습니다.'));

    fetchRelatedProducts(pid)
        .then(setRelated)
        .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (product?.sellerId) {
      fetchReviewsBySeller(product.sellerId).then(setReviews);
    }
    if (id) {
      const pid = Number(id);
      getProductQnaList(pid)
          .then((res: CustomerQnaListResponse) => setQnas(res.content))
          .catch((err) => {
            console.error('Failed to fetch QnAs:', err);
          });
    }
  }, [product, id]);

  useEffect(() => {
    const onScroll = () => {
      if (triggerRef.current) {
        const { top } = triggerRef.current.getBoundingClientRect();
        setSticky(top <= 0);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { averageRating, reviewCount } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avg = totalRating / reviews.length;
    return { averageRating: parseFloat(avg.toFixed(1)), reviewCount: reviews.length };
  }, [reviews]);


  const handleToggleWishlist = () =>
      withAuth(async () => {
        if (!product || wishlistLoading) return;
        setWishlistLoading(true);
        try {
          await toggleWishlist({ productId: product.id });
          setIsWished((prev) => !prev);
        } finally {
          setWishlistLoading(false);
        }
      });

  const handleAddToCart = () =>
      withAuth(async () => {
        if (!product || quantity <= 0) return;
        await addToCart({ productId: product.id, quantity });
        show('장바구니에 추가되었습니다.');
      });

  const handleBuyNow = () =>
      withAuth(async () => {
        if (!product || quantity <= 0) return;
        sessionStorage.setItem('directBuyProductId', product.id.toString());
        sessionStorage.setItem('directBuyQuantity', quantity.toString());
        router.push('/customer/mypage/orders/direct');
      });

  const handleWriteQna = () => {
    withAuth(async () => {
      router.push(`/customer/qna/write?productId=${id}`);
    });
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>로딩 중…</p>;

  return (
      <div>
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductImage
              src={product.imageThumbnailUrl ?? '/default-thumbnail.png'}
              alt={product.name}
              className="w-full h-96 object-contain rounded-lg shadow-md"
          />

          <div>
            <h1 className="text-xl font-light mb-2">{product.name}</h1>
            <p className="text-sm text-gray-700 mb-4">{product.description}</p>
            <p className="text-xl font-light mb-6">
              {product.price.toLocaleString()}
              <span className="text-sm ml-1">원</span>
            </p>

            <div className="mb-6 space-y-2 text-sm text-gray-700">

              <p><span className="font-light">상품상태:</span> {product.status}</p>
              <p><span className="font-light">재고:</span> {product.stock}개</p>
              {product.width && product.depth && product.height && (
                  <p><span className="font-light">사이즈:</span> {product.width}×{product.depth}×{product.height} cm</p>
              )}
              {product.categoryName && (
                  <p><span className="font-light">카테고리:</span> {product.categoryName}</p>
              )}
              {product.sellerName && (
                <p className="cursor-pointer hover:underline text-blue-600"
                  onClick={() => router.push(`/main/seller/${product.id}`)}>
                  <span className="font-light text-gray-700">판매자:</span> {product.sellerName}
                </p>
              )}

              <div className="mb-6">
                <TrafficLightStatusCardforProductDetail
                    rating={averageRating}
                    count={reviewCount}
                    className="" // mx-auto 제거
                />
              </div>

            </div>

            <div className="border-t border-b py-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="font-light text-sm">수량</span>
                <div className="flex items-center gap-2">
                  <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-6 h-6 text-sm flex items-center justify-center border rounded hover:bg-gray-100"
                  >-</button>
                  <span className="w-6 text-center text-sm">{quantity}</span>
                  <button
                      onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                      className="w-6 h-6 text-sm flex items-center justify-center border rounded hover:bg-gray-100"
                  >+</button>
                </div>
              </div>

              <div className="flex items-center justify-between text-base font-light mb-6">
                <span>총 상품금액</span>
                <span>
                {(product.price * quantity).toLocaleString()}
                  <span className="text-sm ml-1">원</span>
              </span>
              </div>

              <div className="flex gap-3">
                <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className="w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-100"
                >
                  {isWished ? (
                      <FaHeart className="w-5 h-5 text-red-500" />
                  ) : (
                      <FaRegHeart className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <button
                    onClick={handleAddToCart}
                    className="flex-1 px-5 py-3 border bg-white hover:bg-gray-100 text-sm font-light"
                >장바구니</button>

                <button
                    onClick={handleBuyNow}
                    className="flex-1 px-5 py-3 bg-black text-white hover:bg-gray-900 text-sm font-light"
                >구매</button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-lg font-light text-gray-600 mb-4">판매자 리뷰</h2>

          {reviews.length > 0 ? (
              <ReviewList reviews={reviews} />
          ) : (
              <p className="text-sm text-gray-600">아직 등록된 리뷰가 없습니다.</p>
          )}
        </div>

        {/* --- 상품 QnA 섹션 시작 --- */}
        <div className="max-w-6xl mx-auto px-4 mt-12">
          <h2 className="text-lg font-light text-gray-600 mb-4">QnA</h2>

          {qnas.length > 0 ? (
              <QnaList qnas={qnas} initialDisplayCount={3} />
          ) : (
              <p className="text-sm text-gray-600 p-4 shadow-sm bg-white">등록된 QnA가 없습니다.</p>
          )}

          {/* 버튼을 아래로 옮기고 오른쪽 정렬 */}
          <div className="flex justify-end mt-4">
            <button
                onClick={handleWriteQna}
                className="px-5 py-2 bg-black text-white rounded-none text-sm font-light hover:bg-gray-900 transition duration-150 ease-in-out"
            >
              등록
            </button>
          </div>
        </div>
        {/* --- 상품 QnA 섹션 끝 --- */}

        {related.length > 0 && (
            <div className="max-w-6xl mx-auto px-4 mt-20">
              <h2 className="text-lg font-light text-gray-600 mb-4">추천 상품</h2>

              {/* 슬라이더 형식으로 수정 */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {related.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => router.push(`/main/products/${item.id}`)}
                        className="cursor-pointer bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition flex-shrink-0 w-44"
                    >
                      <img
                          src={item.imageThumbnailUrl ?? '/default-thumbnail.png'}
                          alt={item.name}
                          className="w-full aspect-[4/3] object-cover"
                      />
                      <div className="p-3">
                        <p className="text-sm font-light truncate text-black">{item.name}</p>
                        <p className="text-sm font-light mt-1 text-black">
                          {item.price.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                ))}
              </div>
            </div>
        )}

        <div ref={triggerRef} className="h-10" />

        <div
            className={`fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg transition-transform duration-300 ${sticky ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-sm font-light truncate">{product.name}</p>
              <p className="text-base font-light">{product.price.toLocaleString()}<span className="text-sm ml-1">원</span></p>
            </div>
            <button
                onClick={handleBuyNow}
                className="bg-red-500 text-white px-8 py-3 rounded-md hover:bg-red-600 text-sm font-light"
            >
              바로 주문
            </button>
          </div>
        </div>
      </div>
  );
}