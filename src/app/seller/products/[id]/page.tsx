'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductDetail, deleteProduct } from '@/service/seller/productService';
import { ProductDetail } from '@/types/seller/product/product';
import SellerLayout from '@/components/layouts/SellerLayout';
import { Edit, Trash2, Package, DollarSign, Eye, Armchair } from 'lucide-react';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';

export default function SellerProductDetailPage() {
    const params = useParams();
    const router = useRouter();
  const checking = useSellerAuthGuard();
    const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const productId = params.id as string;

    useEffect(() => {
        if (checking) return;

        const fetchProduct = async () => {
            try {
        setLoading(true);
        const productData = await getProductDetail(Number(productId));
        setProduct(productData);
      } catch (error) {
        console.error('상품 조회 실패:', error);
        alert('상품을 불러오는데 실패했습니다.');
        router.push('/seller/products');
            } finally {
                setLoading(false);
            }
        };

    if (productId) {
        fetchProduct();
    }
  }, [productId, checking, router]);

    const handleEdit = () => {
        router.push(`/seller/products/${productId}/edit`);
    };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        setDeleting(true);
        await deleteProduct(Number(productId));
        alert('상품이 성공적으로 삭제되었습니다.');
        router.push('/seller/products');
      } catch (error) {
        console.error('상품 삭제 실패:', error);
        alert('상품 삭제에 실패했습니다.');
      } finally {
        setDeleting(false);
      }
    }
  };
    
  if (checking || loading) {
    return (
      <SellerLayout>
        <div className="min-h-screen bg-white p-6">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#374151]"></div>
            <span className="ml-3 text-[#374151] text-lg">상품 정보를 불러오는 중...</span>
            </div>
        </div>
      </SellerLayout>
    );
  }
    
  if (!product) {
    return (
      <SellerLayout>
        <div className="min-h-screen bg-white p-6">
          <div className="text-center py-16">
            <h2 className="text-xl font-bold text-[#374151] mb-4">상품을 찾을 수 없습니다</h2>
            <button
              onClick={() => router.push('/seller/products')}
              className="bg-[#d1d5db] text-[#374151] px-4 py-2 rounded-lg hover:bg-[#e5e7eb] transition-colors"
            >
              상품 목록으로 돌아가기
            </button>
            </div>
        </div>
      </SellerLayout>
    );
  }

    return (
            <SellerLayout>
      <div className="min-h-screen bg-white p-6">
                    {/* 헤더 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-[#374151] tracking-wide mb-2">상품 상세 정보</h1>
            <p className="text-sm text-[#6b7280]">상품의 세부 정보를 확인하고 관리할 수 있습니다.</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 bg-[#d1d5db] text-[#374151] px-4 py-2 rounded-lg hover:bg-[#e5e7eb] transition-colors font-medium shadow-sm border border-[#d1d5db]"
            >
              <Edit className="w-4 h-4" />
              수정
            </button>
                        <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 bg-[#6b7280] text-white px-4 py-2 rounded-lg hover:bg-[#374151] transition-colors font-medium shadow-sm disabled:opacity-50"
                        >
              <Trash2 className="w-4 h-4" />
              {deleting ? '삭제 중...' : '삭제'}
                        </button>
          </div>
                    </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* 상품 이미지 */}
          <div className="bg-[#f3f4f6] rounded-xl shadow border-2 border-[#d1d5db] p-3">
            <h3 className="text-base font-bold text-[#374151] mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#6b7280]" />
              상품 이미지
            </h3>
            <div className="aspect-square bg-white rounded-lg border-2 border-[#d1d5db] overflow-hidden max-w-xs mx-auto">
                                    {product.imageThumbnailUrl ? (
                                        <img
                                            src={product.imageThumbnailUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#f3f4f6]">
                  <Armchair className="w-10 h-10 text-[#6b7280]" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 상품 기본 정보 */}
          <div className="space-y-4">
            <div className="bg-[#f3f4f6] rounded-xl shadow border-2 border-[#d1d5db] p-4">
              <h3 className="text-lg font-bold text-[#374151] mb-3">기본 정보</h3>
              <div className="space-y-3">
                                        <div>
                  <label className="text-sm font-medium text-[#6b7280] block mb-1">상품명</label>
                  <p className="text-[#374151] font-semibold">{product.name}</p>
                                        </div>
                <div>
                  <label className="text-sm font-medium text-[#6b7280] block mb-1">카테고리</label>
                  <p className="text-[#374151]">{product.categoryName}</p>
                                    </div>
                                        </div>
                                    </div>

            {/* 정보 카드들 - 기존 판매자 스타일 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f3f4f6] p-3 rounded-xl shadow border-2 border-[#d1d5db] flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-[#6b7280]" />
                                        <div>
                  <p className="text-xs font-medium text-[#6b7280]">가격</p>
                  <p className="text-sm font-bold text-[#374151]">{product.price.toLocaleString()}원</p>
                                        </div>
                                    </div>

              <div className="bg-[#f3f4f6] p-3 rounded-xl shadow border-2 border-[#d1d5db] flex items-center gap-2">
                <Package className="w-6 h-6 text-[#6b7280]" />
                                        <div>
                  <p className="text-xs font-medium text-[#6b7280]">재고</p>
                  <p className="text-sm font-bold text-[#374151]">{product.stock}개</p>
                                    </div>
                                </div>

              <div className="bg-[#f3f4f6] p-3 rounded-xl shadow border-2 border-[#d1d5db] flex items-center gap-2">
                <Armchair className="w-6 h-6 text-[#6b7280]" />
                <div>
                  <p className="text-xs font-medium text-[#6b7280]">품질</p>
                  <p className="text-sm font-bold text-[#374151]">{product.status}</p>
                </div>
              </div>

              <div className="bg-[#f3f4f6] p-3 rounded-xl shadow border-2 border-[#d1d5db] flex items-center gap-2">
                <Eye className="w-6 h-6 text-[#6b7280]" />
                <div>
                  <p className="text-xs font-medium text-[#6b7280]">상태</p>
                  <p className="text-sm font-bold text-[#374151]">
                    {product.isActive ? '판매중' : '판매중지'}
                  </p>
                </div>
                                </div>
                            </div>
                        </div>

          {/* 크기 정보 & 판매자 정보 & 상품 설명 */}
          <div className="space-y-4">
            {/* 크기 정보 */}
            <div className="bg-[#f3f4f6] rounded-xl shadow border-2 border-[#d1d5db] p-4">
              <h3 className="text-lg font-bold text-[#374151] mb-3">크기 정보</h3>
              <div className="space-y-3">
                                  <div>
                  <label className="text-sm font-medium text-[#6b7280] block mb-1">너비</label>
                  <p className="text-[#374151] font-semibold">{product.width || 0}cm</p>
                                  </div>
                                  <div>
                  <label className="text-sm font-medium text-[#6b7280] block mb-1">높이</label>
                  <p className="text-[#374151] font-semibold">{product.height || 0}cm</p>
                                  </div>
                                      <div>
                  <label className="text-sm font-medium text-[#6b7280] block mb-1">깊이</label>
                  <p className="text-[#374151] font-semibold">{product.depth || 0}cm</p>
                                      </div>
                              </div>
                          </div>

                          {/* 판매자 정보 */}
            <div className="bg-[#f3f4f6] rounded-xl shadow border-2 border-[#d1d5db] p-4">
              <h3 className="text-lg font-bold text-[#374151] mb-3">판매자 정보</h3>
              <div className="space-y-3">
                                  <div>
                  <label className="text-sm font-medium text-[#6b7280] block mb-1">판매자명</label>
                  <p className="text-[#374151] font-semibold">{product.sellerName}</p>
                                  </div>
                                  <div>
                  <label className="text-sm font-medium text-[#6b7280] block mb-1">판매자 ID</label>
                  <p className="text-[#374151] font-mono">{product.sellerId}</p>
                                  </div>
                              </div>
                          </div>

            {/* 상품 설명 */}
            <div className="bg-[#f3f4f6] rounded-xl shadow border-2 border-[#d1d5db] p-4">
              <h3 className="text-lg font-bold text-[#374151] mb-3">상품 설명</h3>
              <div className="bg-white rounded-lg p-3 border border-[#d1d5db] max-h-40 overflow-y-auto">
                <p className="text-[#374151] text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
                    </div>
                </div>
            </SellerLayout>
    );
}
