'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProducts, getMyProductStats } from '@/service/seller/productService';
import { ProductListItem } from '@/types/seller/product/productList';
import { PageResponse } from '@/types/seller/page/pageResponse';
import SellerLayout from '@/components/layouts/SellerLayout';
import { Search, Plus, Edit, Eye, Trash2, Package, Filter } from 'lucide-react';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';

export default function SellerProductListPage() {
  const checking = useSellerAuthGuard();
  const router = useRouter();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // 통계 상태
  const [stats, setStats] = useState({
    total: 0,
    selling: 0,
    suspended: 0,
    outOfStock: 0
  });

  const fetchProducts = async (page = 0) => {
    try {
      setLoading(true);
      const searchParams = {
        page,
        size: 12,
        keyword: searchKeyword || undefined,
        status: statusFilter || undefined,
      };
      
      const [productsResponse, statsResponse] = await Promise.all([
        getMyProducts(searchParams),
        getMyProductStats()
      ]);

      setProducts(productsResponse.dtoList || []);
      setTotalPages(Math.ceil((productsResponse.total || 0) / 12));
      setTotalElements(productsResponse.total || 0);
      setCurrentPage(page);
      setStats(statsResponse);
    } catch (error) {
      console.error('상품 목록 조회 실패:', error);
      alert('상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checking) return;
    fetchProducts();
  }, [checking]);

  const handleSearch = () => {
    fetchProducts(0);
  };

  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage);
  };

  const handleEdit = (productId: number) => {
    router.push(`/seller/products/${productId}/edit`);
  };

  const handleView = (productId: number) => {
    router.push(`/seller/products/${productId}`);
  };

  const getStatusBadge = (product: ProductListItem) => {
    if (product.stock === 0) {
      return <span className="px-2 py-1 rounded text-xs font-bold bg-[#f87171] text-white">품절</span>;
    } else if (!product.isActive) {
      return <span className="px-2 py-1 rounded text-xs font-bold bg-[#6b7280] text-white">판매중지</span>;
    } else {
      return <span className="px-2 py-1 rounded text-xs font-bold bg-[#6b7280] text-white">판매중</span>;
    }
  };

  if (checking || loading) {
    return (
      <SellerLayout>
        <div className="min-h-screen bg-white p-6">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#374151]"></div>
            <span className="ml-3 text-[#374151] text-lg">상품 목록을 불러오는 중...</span>
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
            <h1 className="text-2xl font-extrabold text-[#374151] tracking-wide mb-2">상품 관리</h1>
            <p className="text-sm text-[#6b7280]">등록된 상품을 관리하고 새로운 상품을 추가할 수 있습니다.</p>
          </div>
          <button
            onClick={() => router.push('/seller/products/new')}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-[#6b7280] text-white px-4 py-2 rounded-lg hover:bg-[#374151] transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            신규 상품 등록
          </button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#f3f4f6] p-6 rounded-xl shadow border-2 border-[#d1d5db] hover:scale-[1.02] transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6b7280]">총 상품 수</p>
                <p className="text-2xl font-bold text-[#374151]">{stats.total}개</p>
              </div>
              <Package className="w-8 h-8 text-[#6b7280]" />
            </div>
            <div className="mt-4 bg-[#d1d5db] rounded-full h-2">
              <div 
                className="bg-[#374151] h-2 rounded-full" 
                style={{ width: stats.total > 0 ? '100%' : '0%' }}
              ></div>
            </div>
          </div>

          <div className="bg-[#f3f4f6] p-6 rounded-xl shadow border-2 border-[#d1d5db] hover:scale-[1.02] transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6b7280]">판매중</p>
                <p className="text-2xl font-bold text-[#6b7280]">{stats.selling}개</p>
              </div>
              <Eye className="w-8 h-8 text-[#6b7280]" />
            </div>
            <div className="mt-4 bg-[#d1d5db] rounded-full h-2">
              <div 
                className="bg-[#6b7280] h-2 rounded-full" 
                style={{ width: stats.total > 0 ? `${(stats.selling / stats.total) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>

          <div className="bg-[#f3f4f6] p-6 rounded-xl shadow border-2 border-[#d1d5db] hover:scale-[1.02] transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6b7280]">품절</p>
                <p className="text-2xl font-bold text-[#f87171]">{stats.outOfStock}개</p>
              </div>
              <Package className="w-8 h-8 text-[#f87171]" />
            </div>
            <div className="mt-4 bg-[#d1d5db] rounded-full h-2">
              <div 
                className="bg-[#f87171] h-2 rounded-full" 
                style={{ width: stats.total > 0 ? `${(stats.outOfStock / stats.total) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>

          <div className="bg-[#f3f4f6] p-6 rounded-xl shadow border-2 border-[#d1d5db] hover:scale-[1.02] transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6b7280]">판매중지</p>
                <p className="text-2xl font-bold text-[#6b7280]">{stats.suspended}개</p>
              </div>
              <Package className="w-8 h-8 text-[#6b7280]" />
            </div>
            <div className="mt-4 bg-[#d1d5db] rounded-full h-2">
              <div 
                className="bg-[#6b7280] h-2 rounded-full" 
                style={{ width: stats.total > 0 ? `${(stats.suspended / stats.total) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-[#f3f4f6] rounded-xl shadow border-2 border-[#d1d5db] p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b7280] w-4 h-4" />
                <input
                  type="text"
                  placeholder="상품명으로 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#6b7280] focus:border-transparent bg-white text-[#374151]"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#6b7280] focus:border-transparent bg-white text-[#374151]"
              >
                <option value="">전체 상태</option>
                <option value="active">판매중</option>
                <option value="inactive">판매중지</option>
                <option value="out_of_stock">품절</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-2 bg-[#6b7280] text-white px-6 py-3 rounded-xl hover:bg-[#374151] transition-colors font-medium shadow-sm"
            >
              <Filter className="w-4 h-4" />
              검색
            </button>
          </div>
        </div>

        {/* 상품 그리드 */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-[#f3f4f6] rounded-xl shadow border-2 border-[#d1d5db]">
            <Package className="w-16 h-16 text-[#6b7280] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#374151] mb-2">등록된 상품이 없습니다</h3>
            <p className="text-[#6b7280] mb-6">첫 번째 상품을 등록해보세요!</p>
            <button
              onClick={() => router.push('/seller/products/new')}
              className="inline-flex items-center gap-2 bg-[#6b7280] text-white px-4 py-2 rounded-lg hover:bg-[#374151] transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              신규 상품 등록
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-[#f3f4f6] rounded-xl shadow border-2 border-[#d1d5db] overflow-hidden hover:scale-[1.02] transition-all duration-200"
              >
                {/* 상품 이미지 */}
                <div className="aspect-square bg-white">
                  {product.imageThumbnailUrl ? (
                    <img
                      src={product.imageThumbnailUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#f3f4f6]">
                      <Package className="w-12 h-12 text-[#6b7280]" />
                    </div>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-[#374151] text-sm line-clamp-2 flex-1">
                      {product.name}
                    </h3>
                    {getStatusBadge(product)}
                  </div>
                  
                  <p className="text-lg font-bold text-[#374151] mb-2">
                    {product.price.toLocaleString()}원
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-[#6b7280] mb-4">
                    <span>재고: {product.stock}개</span>
                    <span>{product.categoryName}</span>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(product.id)}
                      className="flex-1 bg-[#d1d5db] text-[#374151] px-3 py-2 rounded-lg hover:bg-[#e5e7eb] transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      보기
                    </button>
                    <button
                      onClick={() => handleEdit(product.id)}
                      className="flex-1 bg-[#6b7280] text-white px-3 py-2 rounded-lg hover:bg-[#374151] transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      수정
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 border border-[#d1d5db] rounded-lg hover:bg-[#f3f4f6] disabled:opacity-50 disabled:cursor-not-allowed text-[#374151] bg-white"
              >
                이전
              </button>
              
              {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                const pageNum = Math.floor(currentPage / 10) * 10 + i;
                if (pageNum >= totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 border border-[#d1d5db] rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#6b7280] text-white'
                        : 'bg-white text-[#374151] hover:bg-[#f3f4f6]'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-2 border border-[#d1d5db] rounded-lg hover:bg-[#f3f4f6] disabled:opacity-50 disabled:cursor-not-allowed text-[#374151] bg-white"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
