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
          <h1 className="text-xl md:text-2xl font-bold mb-6 text-[#5b4636]">상품 관리</h1>

          {/* 상단 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <section className="bg-[#e3f6f5] p-6 rounded-xl shadow border-2 border-[#4fd1c7] flex items-center justify-between">
              <div>
                <h2 className="text-[#0f766e] text-sm font-semibold mb-2">총 상품 수</h2>
                <p className="text-2xl font-bold text-[#0f766e]">{totalProductCount}개</p>
              </div>
              <Package className="w-8 h-8 text-[#4fd1c7]" />
            </section>
            <section className="bg-[#e3f6f5] p-6 rounded-xl shadow border-2 border-[#4fd1c7] flex items-center justify-between">
              <div>
                <h2 className="text-[#0f766e] text-sm font-semibold mb-2">판매 중</h2>
                <p className="text-2xl font-bold text-[#0f766e]">{products.filter(p => p.status === '상').length}개</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#4fd1c7]" />
            </section>
            <section className="bg-[#e3f6f5] p-6 rounded-xl shadow border-2 border-[#4fd1c7] flex items-center justify-between">
              <div>
                <h2 className="text-[#0f766e] text-sm font-semibold mb-2">품절</h2>
                <p className="text-2xl font-bold text-[#0f766e]">{products.filter(p => p.status === '하').length}개</p>
              </div>
              <XCircle className="w-8 h-8 text-[#4fd1c7]" />
            </section>
            <section className="bg-[#e3f6f5] p-6 rounded-xl shadow border-2 border-[#4fd1c7] flex items-center justify-between">
              <div>
                <h2 className="text-[#0f766e] text-sm font-semibold mb-2">판매 중지</h2>
                <p className="text-2xl font-bold text-[#0f766e]">{products.filter(p => p.status === '중').length}개</p>
              </div>
              <PauseCircle className="w-8 h-8 text-[#4fd1c7]" />
            </section>
          </div>

          {/* 검색/필터 영역 */}
          <div className="bg-[#e3f6f5] p-4 md:p-6 rounded-lg shadow-sm border-2 border-[#4fd1c7] mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="상품명으로 검색..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 border-2 border-[#4fd1c7] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4fd1c7] bg-[#e3f6f5] text-[#0f766e]"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-2 border-[#4fd1c7] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4fd1c7] bg-[#e3f6f5] text-[#0f766e]"
              >
                <option value="">전체 상태</option>
                <option value="상">상</option>
                <option value="중">중</option>
                <option value="하">하</option>
              </select>
            </div>
          </div>

          {/* 상품 리스트 (쇼피파이 스타일 테이블+카드) */}
          <div className="overflow-x-auto bg-[#e3f6f5] rounded-xl shadow border border-[#bfa06a]">
            <table className="min-w-full divide-y divide-[#bfa06a]">
              <thead className="bg-[#e3f6f5]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#bfa06a] uppercase tracking-wider">상품명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#bfa06a] uppercase tracking-wider">가격</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#bfa06a] uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#bfa06a] uppercase tracking-wider">재고</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#bfa06a] uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-[#e3f6f5] divide-y divide-[#bfa06a]">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[#bfa06a]">상품이 없습니다.</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-[#bfa06a] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-[#5b4636]">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#5b4636]">{product.price.toLocaleString()}원</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${product.status === '상' ? 'bg-green-100 text-green-700' : product.status === '중' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{product.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#5b4636]">{product.stock ?? 0}개</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => router.push(`/seller/products/${product.id}`)}
                          className="inline-flex items-center gap-1 bg-[#bfa06a] text-[#4b3a2f] px-3 py-1.5 rounded hover:bg-[#5b4636] hover:text-[#e9dec7] text-sm transition-colors"
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
                      ? 'bg-[#bfa06a] text-[#4b3a2f] border-[#bfa06a]'
                      : 'bg-[#e3f6f5] text-[#2d1b0f] border-[#bfa06a] hover:bg-[#bfa06a] hover:text-[#4b3a2f]'}
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
