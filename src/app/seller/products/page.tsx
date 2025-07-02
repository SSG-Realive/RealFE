'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SellerHeader from '@/components/seller/SellerHeader';
import SellerLayout from '@/components/layouts/SellerLayout';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import { Armchair, Layers, AlertTriangle, Plus, Eye, TrendingUp, TrendingDown, BadgeCheck, Ban, Calculator, Package, XCircle, PauseCircle } from 'lucide-react';
import Link from 'next/link';

import { getMyProducts, getMyProductStats } from '@/service/seller/productService';
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
  
  // 전체 상품 통계 상태 추가
  const [productStats, setProductStats] = useState({
    total: 0,
    selling: 0,
    suspended: 0,
    outOfStock: 0
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 상품 상태 매핑 함수 - 실제 판매 상태 기반으로 수정
  const getProductSalesStatus = (product: ProductListItem) => {
    if (product.stock === 0) return { text: '품절', color: 'bg-red-100 text-red-800' };
    if (!product.isActive) return { text: '판매중지', color: 'bg-yellow-100 text-yellow-800' };
    return { text: '판매중', color: 'bg-green-100 text-green-800' };
  };

  // 품질등급 색상 지정 함수 (기존 status는 품질등급)
  const getQualityGradeColor = (status: string) => {
    switch (status) {
      case '상': return 'bg-green-100 text-green-800';
      case '중': return 'bg-yellow-100 text-yellow-800';
      case '하': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 전체 상품 통계 가져오기
  const fetchProductStats = async () => {
    try {
      const stats = await getMyProductStats();
      setProductStats(stats);
    } catch (error) {
      console.error('상품 통계 조회 실패:', error);
    }
  };

  useEffect(() => {
    if (checking) return;

    const page = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(page);
    fetchProductList(page);
    fetchProductStats(); // 전체 상품 통계도 함께 가져오기
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
    fetchProductStats(); // 검색/필터링 시에도 전체 통계 업데이트
    router.push(`/seller/products?page=1`);
  };

  const handleRegisterClick = () => {
    router.push('/seller/products/new');
  };

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
              <div className="text-2xl font-bold text-[#374151]">{productStats.total}개</div>
            </section>
            <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all hover:bg-[#e5e7eb] cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <span className="text-[#374151] text-sm font-semibold">판매중</span>
              </div>
              <div className="text-2xl font-bold text-green-700">{productStats.selling}개</div>
            </section>
            <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all hover:bg-[#e5e7eb] cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-8 h-8 text-red-600" />
                <span className="text-[#374151] text-sm font-semibold">품절</span>
              </div>
              <div className="text-2xl font-bold text-red-700">{productStats.outOfStock}개</div>
            </section>
            <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all hover:bg-[#e5e7eb] cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <PauseCircle className="w-8 h-8 text-yellow-600" />
                <span className="text-[#374151] text-sm font-semibold">판매중지</span>
              </div>
              <div className="text-2xl font-bold text-yellow-700">{productStats.suspended}개</div>
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
              <option value="">전체 품질등급</option>
              <option value="상">상</option>
              <option value="중">중</option>
              <option value="하">하</option>
            </select>
            <button
              onClick={handleSearch}
              className="bg-[#d1d5db] text-[#374151] px-6 py-2 rounded-md hover:bg-[#e5e7eb] transition-colors font-medium"
            >
              검색
            </button>
            </div>
          </div>

          {/* 상품 리스트 (쇼피파이 스타일 테이블+카드) */}
          <div className="overflow-x-auto bg-[#f3f4f6] rounded-xl shadow border border-[#d1d5db]">
            <table className="min-w-full divide-y divide-[#d1d5db]">
              <thead className="bg-[#f3f4f6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#d1d5db] uppercase tracking-wider">상품명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#d1d5db] uppercase tracking-wider">가격</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#d1d5db] uppercase tracking-wider">품질등급</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#d1d5db] uppercase tracking-wider">판매상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#d1d5db] uppercase tracking-wider">재고</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#d1d5db] uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-[#f3f4f6] divide-y divide-[#d1d5db]">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#d1d5db]">상품이 없습니다.</td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const salesStatus = getProductSalesStatus(product);
                    return (
                    <tr key={product.id} className="hover:bg-[#e5e7eb] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-[#374151]">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{product.price.toLocaleString()}원</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getQualityGradeColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${salesStatus.color}`}>
                          {salesStatus.text}
                        </span>
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
                  )})
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
