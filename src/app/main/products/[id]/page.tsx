'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useParams,
  useRouter,
  usePathname,
} from 'next/navigation';

import {
  fetchProductDetail,
  fetchRelatedProducts,
} from '@/service/customer/productService';
import { toggleWishlist } from '@/service/customer/wishlistService';
import { addToCart } from '@/service/customer/cartService';
import { fetchReviewsBySeller } from '@/service/customer/reviewService';
// 고객 QnA 서비스 임포트
import { getProductQnaList } from '@/service/customer/customerQnaService';

import ReviewList from '@/components/customer/review/ReviewList';
import ProductImage from '@/components/ProductImage';
// QnA 리스트 컴포넌트 임포트
import QnaList from '@/components/customer/qna/QnaList';

import { ProductDetail, ProductListDTO } from '@/types/seller/product/product';
import { ReviewResponseDTO } from '@/types/customer/review/review';
// QnA DTO 임포트 (sellerQnaResponse에서 필요 DTO만 임포트)
import { SellerQnaResponse, SellerQnaListResponse } from '@/types/seller/sellerqna/sellerQnaResponse';

import { FaHeart, FaRegHeart } from 'react-icons/fa';
// useAuthStore 관련 코드는 제거
// import { useAuthStore } from '@/store/customer/authStore';
import { useGlobalDialog } from '@/app/context/dialogContext';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const { show } = useGlobalDialog();
  // useAuthStore 관련 변수 제거
  // const { accessToken, user } = useAuthStore();

  // withAuth 함수에서 인증 관련 로직 제거 (현재는 단순히 action 실행)
  const withAuth = async (action: () => Promise<void>) => {
    // 실제 로그인 여부 확인 및 리디렉션 로직은 인증 시스템 구현 후 추가
    await action();
  };

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [related, setRelated] = useState<ProductListDTO[]>([]);
  const [reviews, setReviews] = useState<ReviewResponseDTO[]>([]);
  const [qnas, setQnas] = useState<SellerQnaResponse[]>([]); // QnA 상태 추가
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
    // 상품 ID가 있을 때 QnA 목록 가져오기
    if (id) {
      const pid = Number(id);
      getProductQnaList(pid) // 상품 ID를 사용하여 QnA 목록 조회
          .then((res: SellerQnaListResponse) => setQnas(res.content)) // content 배열만 저장
          .catch((err) => {
            console.error('Failed to fetch QnAs:', err);
            // 필요하다면 사용자에게 에러 메시지 표시
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
        router.push('/customer/orders/direct');
      });

  // QnA 작성 페이지로 이동하는 핸들러 (인증 로직 제거)
  const handleWriteQna = () => {
    withAuth(async () => {
      // QnA 작성 페이지로 이동. 예: /customer/qna/write?productId=123
      router.push(`/customer/qna/write?productId=${id}`);
    });
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>로딩 중…</p>;

  const totalPrice = (product.price * quantity).toLocaleString();

  return (
      <div>
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductImage
              src={product.imageThumbnailUrl ?? '/default-thumbnail.png'}
              alt={product.name}
              className="w-full h-96 object-contain rounded-lg shadow-md"
          />

          <div>
            <h1 className="text-2xl font-light mb-2">{product.name}</h1>
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
                  <p><span className="font-light">판매자:</span> {product.sellerName}</p>
              )}
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
                >바로 구매</button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-lg font-light mb-4">판매자 리뷰</h2>
          {reviews.length > 0 ? (
              <ReviewList reviews={reviews} />
          ) : (
              <p className="text-sm text-gray-600">아직 등록된 리뷰가 없습니다.</p>
          )}
        </div>

        {/* --- 상품 QnA 섹션 시작 --- */}
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-light">상품 QnA</h2> {/* 제목을 '상품 QnA'로 변경 */}
            {/* QnA 작성 버튼 (이제 역할 조건 없이 항상 표시) */}
            <button
                onClick={handleWriteQna}
                className="px-4 py-2 border rounded-md text-sm font-light bg-gray-50 hover:bg-gray-100"
            >
              QnA 작성
            </button>
          </div>
          {qnas.length > 0 ? (
              <QnaList qnas={qnas} initialDisplayCount={3} />
            ) : (
            <p className="text-sm text-gray-600">아직 등록된 QnA가 없습니다.</p>
            )}
        </div>
        {/* --- 상품 QnA 섹션 끝 --- */}

        {related.length > 0 && (
            <div className="max-w-6xl mx-auto px-4 mt-8">
              <h2 className="text-lg font-light mb-4">추천상품</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {related.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => router.push(`/main/products/${item.id}`)}
                        className="cursor-pointer bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition"
                    >
                      <img
                          src={item.imageThumbnailUrl ?? '/default-thumbnail.png'}
                          alt={item.name}
                          className="w-full aspect-[4/3] object-cover"
                      />
                      <div className="p-3">
                        <p className="text-sm font-light truncate text-black">{item.name}</p>
                        <p className="text-sm font-light mt-1 text-black">{item.price.toLocaleString()}원</p>
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