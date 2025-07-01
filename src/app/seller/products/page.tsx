'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SellerHeader from '@/components/seller/SellerHeader';
import SellerLayout from '@/components/layouts/SellerLayout';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import { Armchair, Layers, AlertTriangle, Plus, Eye, TrendingUp, TrendingDown, BadgeCheck, Ban, Calculator, Package, XCircle, PauseCircle } from 'lucide-react';
import Link from 'next/link';

import { getMyProducts } from '@/service/seller/productService';
import { ProductListItem } from '@/types/seller/product/productList';

export default function ProductListPage() {
  const checking = useSellerAuthGuard();
   

  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalProductCount, setTotalProductCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (checking) return;

    const page = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(page);
    fetchProductList(page);
  }, [searchParams, checking]);

  const fetchProductList = async (page: number) => {
    try {
      const data = await getMyProducts({
        page,
        keyword,
        status: statusFilter,
      });

      setProducts(data.dtoList);
      setTotalProductCount(data.total);
      setTotalPages(Math.ceil(data.total / data.size));
    } catch (err) {
      console.error('상품 목록 조회 실패', err);
    }
  };

  const goToPage = (page: number) => {
    router.push(`/seller/products?page=${page}`);
  };

  const handleSearch = () => {
    if (checking) return;
    fetchProductList(1);
    router.push(`/seller/products?page=1`);
  };

  const handleRegisterClick = () => {
    router.push('/seller/products/new');
  };

  // 통계 계산
  const avgPrice = products.length > 0 ? Math.round(products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length) : 0;
  const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 0;
  const minPrice = products.length > 0 ? Math.min(...products.map(p => p.price)) : 0;
  const pendingCount = products.filter(p => p.status === '승인대기').length;
  const rejectedCount = products.filter(p => p.status === '반려').length;

  if (checking) return (
    <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">인증 확인 중...</p>
      </div>
    </div>
  ); // ✅ 인증 확인 중 UI 
  return (
    <>
      <div className="hidden">
      <SellerHeader toggleSidebar={toggleSidebar} />
      </div>
      <SellerLayout>
        <div className="flex-1 w-full h-full px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-[#0f766e]">상품 관리</h1>
            <button
              onClick={handleRegisterClick}
              className="inline-flex items-center gap-2 bg-[#d1d5db] text-[#374151] px-4 py-2 rounded-lg hover:bg-[#e5e7eb] transition-colors font-medium shadow-sm border border-[#d1d5db]"
            >
              <Plus className="w-5 h-5" />
              상품 등록
            </button>
          </div>

          {/* 상단 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-8 h-8 text-[#6b7280]" />
                <span className="text-[#374151] text-sm font-semibold">총 상품 수</span>
              </div>
              <div className="text-2xl font-bold text-[#374151]">{totalProductCount}개</div>
            </section>
            <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8 text-[#6b7280]" />
                <span className="text-[#374151] text-sm font-semibold">판매 중</span>
              </div>
              <div className="text-2xl font-bold text-[#374151]">{products.filter(p => p.status === '상').length}개</div>
            </section>
            <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-8 h-8 text-[#6b7280]" />
                <span className="text-[#374151] text-sm font-semibold">품절</span>
              </div>
              <div className="text-2xl font-bold text-[#374151]">{products.filter(p => p.status === '하').length}개</div>
            </section>
            <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
              <div className="flex items-center gap-3 mb-2">
                <PauseCircle className="w-8 h-8 text-[#6b7280]" />
                <span className="text-[#374151] text-sm font-semibold">판매 중지</span>
              </div>
              <div className="text-2xl font-bold text-[#374151]">{products.filter(p => p.status === '중').length}개</div>
            </section>
          </div>

          {/* 검색/필터 영역 */}
          <div className="bg-[#f3f4f6] p-4 md:p-6 rounded-lg shadow-sm border-2 border-[#d1d5db] mb-6">
            <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
                placeholder="상품명으로 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 border-2 border-[#d1d5db] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d1d5db] bg-[#f3f4f6] text-[#374151]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
                className="border-2 border-[#d1d5db] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d1d5db] bg-[#f3f4f6] text-[#374151]"
            >
              <option value="">전체 상태</option>
              <option value="상">상</option>
              <option value="중">중</option>
              <option value="하">하</option>
            </select>
            </div>
          </div>

          {/* 상품 리스트 (쇼피파이 스타일 테이블+카드) */}
          <div className="overflow-x-auto bg-[#f3f4f6] rounded-xl shadow border border-[#d1d5db]">
            <table className="min-w-full divide-y divide-[#d1d5db]">
              <thead className="bg-[#f3f4f6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#d1d5db] uppercase tracking-wider">상품명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#d1d5db] uppercase tracking-wider">가격</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#d1d5db] uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#d1d5db] uppercase tracking-wider">재고</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#d1d5db] uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-[#f3f4f6] divide-y divide-[#d1d5db]">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[#d1d5db]">상품이 없습니다.</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-[#e5e7eb] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-[#374151]">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{product.price.toLocaleString()}원</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold bg-[#e5e7eb] text-[#374151]`}>{product.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{product.stock ?? 0}개</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => router.push(`/seller/products/${product.id}`)}
                          className="inline-flex items-center gap-1 bg-[#d1d5db] text-[#374151] px-3 py-1.5 rounded hover:bg-[#e5e7eb] hover:text-[#374151] text-sm transition-colors"
                        >
                          <Eye className="w-4 h-4" /> 상세 보기
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => goToPage(i + 1)}
                  className={`px-4 py-2 rounded-lg font-bold shadow-sm border text-sm transition-colors
                    ${currentPage === i + 1
                      ? 'bg-[#d1d5db] text-[#374151] border-[#d1d5db]'
                      : 'bg-[#f3f4f6] text-[#374151] border-[#d1d5db] hover:bg-[#d1d5db] hover:text-[#374151]'}
                  `}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </SellerLayout>
    </>
  );
}
