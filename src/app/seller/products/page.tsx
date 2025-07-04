'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SellerHeader from '@/components/seller/SellerHeader';
import SellerLayout from '@/components/layouts/SellerLayout';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import { Armchair, Layers, AlertTriangle, Plus, Eye, TrendingUp, TrendingDown, BadgeCheck, Ban, Calculator, Package, XCircle, PauseCircle, RefreshCw, Search, Filter, Sparkles, ShoppingBag, DollarSign, Star } from 'lucide-react';
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
    <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">인증 확인 중...</p>
      </div>
    </div>
  ); // ✅ 인증 확인 중 UI 
  return (
    <>
      <div className="hidden">
      <SellerHeader toggleSidebar={toggleSidebar} />
      </div>
      <SellerLayout>
        <div className="flex-1 w-full h-full px-4 py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-3">
              <ShoppingBag className="w-10 h-10 text-indigo-600" />
              상품 관리
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  fetchProductList(currentPage);
                  fetchProductStats();
                }}
                className="group flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-700 px-5 py-3 rounded-xl hover:bg-white transition-all duration-200 font-semibold shadow-lg border border-white/50 hover:shadow-xl hover:scale-[1.02]"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                새로고침
              </button>
              <button
                onClick={handleRegisterClick}
                className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                상품 등록
              </button>
            </div>
          </div>

          {/* 상단 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <section className="group bg-gradient-to-r from-slate-50 to-white backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6 min-h-[160px] transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-slate-500 to-gray-600 rounded-xl text-white">
                  <Package className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-gray-700 bg-clip-text text-transparent">
                  {productStats.total}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-slate-700 font-bold text-lg">총 상품 수</h3>
                <p className="text-slate-500 text-sm">전체 등록된 상품</p>
              </div>
              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-slate-400 to-gray-500 rounded-full w-full"></div>
              </div>
            </section>

            <section className="group bg-gradient-to-r from-emerald-50 to-green-50 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-200/50 p-6 min-h-[160px] transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                  {productStats.selling}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-emerald-700 font-bold text-lg">판매중</h3>
                <p className="text-emerald-600 text-sm">활성 상품</p>
              </div>
              <div className="mt-4 h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${productStats.total > 0 ? (productStats.selling / productStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </section>

            <section className="group bg-gradient-to-r from-red-50 to-pink-50 backdrop-blur-lg rounded-2xl shadow-xl border border-red-200/50 p-6 min-h-[160px] transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white">
                  <XCircle className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-700 bg-clip-text text-transparent">
                  {productStats.outOfStock}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-red-700 font-bold text-lg">품절</h3>
                <p className="text-red-600 text-sm">재고 부족</p>
              </div>
              <div className="mt-4 h-2 bg-red-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-400 to-pink-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${productStats.total > 0 ? (productStats.outOfStock / productStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </section>

            <section className="group bg-gradient-to-r from-amber-50 to-orange-50 backdrop-blur-lg rounded-2xl shadow-xl border border-amber-200/50 p-6 min-h-[160px] transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white">
                  <PauseCircle className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">
                  {productStats.suspended}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-amber-700 font-bold text-lg">판매중지</h3>
                <p className="text-amber-600 text-sm">비활성 상품</p>
              </div>
              <div className="mt-4 h-2 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${productStats.total > 0 ? (productStats.suspended / productStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </section>
          </div>

          {/* 검색/필터 영역 */}
          <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/50 mb-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-700">상품 검색 및 필터</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="상품명으로 검색..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium min-w-[160px]"
                >
                  <option value="">전체 품질등급</option>
                  <option value="상">상급</option>
                  <option value="중">중급</option>
                  <option value="하">하급</option>
                </select>
              </div>
              <button
                onClick={handleSearch}
                className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                검색
              </button>
            </div>
          </div>

          {/* 상품 목록 */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">등록된 상품이 없습니다.</p>
                <p className="text-gray-500">새로운 상품을 등록해보세요!</p>
              </div>
            ) : (
              <>
                {/* 테이블 헤더 */}
                <div className="bg-gradient-to-r from-slate-100 to-gray-100 px-6 py-4 border-b border-slate-200">
                  <div className="grid grid-cols-12 gap-4 font-bold text-slate-700">
                    <div className="col-span-1 text-center">이미지</div>
                    <div className="col-span-3">상품명</div>
                    <div className="col-span-2 text-center">가격</div>
                    <div className="col-span-1 text-center">재고</div>
                    <div className="col-span-1 text-center">품질</div>
                    <div className="col-span-2 text-center">판매상태</div>
                    <div className="col-span-2 text-center">관리</div>
                  </div>
                </div>

                {/* 상품 목록 */}
                <div className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const salesStatus = getProductSalesStatus(product);
                    return (
                      <div key={product.id} className="px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* 상품 이미지 */}
                          <div className="col-span-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                              {product.imageThumbnailUrl ? (
                                <img 
                                  src={product.imageThumbnailUrl} 
                                  alt={product.name}
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-slate-400" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 상품명 */}
                          <div className="col-span-3">
                            <Link 
                              href={`/seller/products/${product.id}`}
                              className="group"
                            >
                              <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
                                {product.name}
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">ID: {product.id}</p>
                            </Link>
                          </div>

                          {/* 가격 */}
                          <div className="col-span-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <DollarSign className="w-4 h-4 text-emerald-600" />
                              <span className="font-bold text-slate-800">{product.price.toLocaleString()}원</span>
                            </div>
                          </div>

                          {/* 재고 */}
                          <div className="col-span-1 text-center">
                            <span className={`font-bold ${product.stock === 0 ? 'text-red-600' : 'text-slate-800'}`}>
                              {product.stock}개
                            </span>
                          </div>

                          {/* 품질등급 */}
                          <div className="col-span-1 text-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getQualityGradeColor(product.status)}`}>
                              {product.status}
                            </span>
                          </div>

                          {/* 판매상태 */}
                          <div className="col-span-2 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${salesStatus.color}`}>
                              {product.isActive ? <TrendingUp className="w-3 h-3" /> : <PauseCircle className="w-3 h-3" />}
                              {salesStatus.text}
                            </span>
                          </div>

                          {/* 관리 버튼 */}
                          <div className="col-span-2 text-center">
                            <div className="flex gap-2 justify-center">
                              <Link 
                                href={`/seller/products/${product.id}`}
                                className="group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                              >
                                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                              </Link>
                              <Link 
                                href={`/seller/products/${product.id}/edit`}
                                className="group bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                              >
                                <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-2">
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </SellerLayout>
    </>
  );
}
