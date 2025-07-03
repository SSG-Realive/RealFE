'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/apiClient';
import { Users, Search, Filter, UserCheck, UserX, CheckCircle, XCircle, ChevronDown } from 'lucide-react';

interface Seller {
  id: number;
  name: string;
  email: string;
  image?: string;
  is_approved: boolean;
  is_active: boolean;
}

interface ApiResponse {
  data: {
    data: {
      content: Seller[];
      totalElements: number;
      totalPages: number;
    };
  };
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const AdminSellersPage: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    approved: 0,
    pending: 0
  });
  const router = useRouter();

  // 인증 체크
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
      router.replace('/admin/login');
      return;
    }
  }, [router]);

  // 판매자 통계 데이터 로딩
  const fetchTotalStats = async () => {
    try {
      const response = await adminApi.get('/admin/users?userType=SELLER&page=0&size=1000');
      const sellerData = response.data.data.content || [];
      
      const totalActive = sellerData.filter((seller: any) => 
        seller.is_active === true || seller.is_active === 'true' || seller.is_active === 1 ||
        seller.isActive === true || seller.isActive === 'true' || seller.isActive === 1
      ).length;
      
      const totalApproved = sellerData.filter((seller: any) => 
        seller.is_approved === true || seller.is_approved === 'true' || seller.is_approved === 1 ||
        seller.isApproved === true || seller.isApproved === 'true' || seller.isApproved === 1
      ).length;
      
      setTotalStats({
        total: sellerData.length,
        active: totalActive,
        inactive: sellerData.length - totalActive,
        approved: totalApproved,
        pending: sellerData.length - totalApproved
      });
    } catch (err) {
      console.error('판매자 통계 로딩 실패:', err);
    }
  };

  // 데이터 로딩
  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        userType: 'SELLER',
        page: '0',
        size: '100',
      });

      const response: ApiResponse = await adminApi.get(`/admin/users?${params.toString()}`);
      
      const sellersWithBoolean = (response.data.data.content || []).map((s: any) => ({
        ...s,
        is_approved: Boolean(s.is_approved === true || s.is_approved === 'true' || s.is_approved === 1 || s.isApproved === true || s.isApproved === 'true' || s.isApproved === 1),
        is_active: Boolean(s.is_active === true || s.is_active === 'true' || s.is_active === 1 || s.isActive === true || s.isActive === 'true' || s.isActive === 1)
      }));
      
      setSellers(sellersWithBoolean);
    } catch (err) {
      const error = err as ErrorResponse;
      setError(error?.response?.data?.message || error?.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSellers();
    fetchTotalStats();
  }, [fetchSellers]);

  // 필터링된 판매자 목록
  const filteredSellers = useMemo(() => {
    return sellers.filter(seller => {
      const matchesSearch = !search.trim() || 
        seller.name.toLowerCase().includes(search.toLowerCase()) ||
        seller.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = !status || 
        (status === '승인' && seller.is_approved) ||
        (status === '승인처리전' && !seller.is_approved);
      
      const matchesActiveFilter = !activeFilter || 
        (activeFilter === 'active' && seller.is_active) ||
        (activeFilter === 'inactive' && !seller.is_active);
      
      return matchesSearch && matchesStatus && matchesActiveFilter;
    });
  }, [sellers, search, status, activeFilter]);

  // 상태 토글 핸들러
  const handleToggleActive = useCallback(async (seller: Seller) => {
    try {
      setUpdatingId(seller.id);
      
      await adminApi.put(`/admin/users/sellers/${seller.id}/status`, {
        isActive: !seller.is_active
      });
      
      setSellers(prev =>
        prev.map(s =>
          s.id === seller.id ? { ...s, is_active: !s.is_active } : s
        )
      );
      
      // 상태 변경 후 전체 통계 다시 로딩
      fetchTotalStats();
    } catch (err) {
      const error = err as ErrorResponse;
      alert(`상태 변경 실패: ${error?.response?.data?.message || error?.message || '알 수 없는 오류'}`);
    } finally {
      setUpdatingId(null);
    }
  }, [fetchTotalStats]);

  // 승인/거절 핸들러
  const handleApproval = useCallback(async (seller: Seller, approved: boolean) => {
    try {
      setUpdatingId(seller.id);
      
      await adminApi.post('/admin/sellers/approve', {
        sellerId: seller.id,
        approve: approved
      });
      
      setSellers(prev =>
        prev.map(s =>
          s.id === seller.id ? { ...s, is_approved: approved } : s
        )
      );
      
      // 승인/거절 후 전체 통계 다시 로딩
      fetchTotalStats();
      
      alert(`${seller.name} ${approved ? '승인' : '거절'} 처리되었습니다.`);
    } catch (err) {
      const error = err as ErrorResponse;
      alert(`처리 실패: ${error?.response?.data?.message || error?.message || '알 수 없는 오류'}`);
    } finally {
      setUpdatingId(null);
    }
  }, [fetchTotalStats]);

  // 이벤트 핸들러
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  }, []);

  const handleActiveFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveFilter(e.target.value);
  }, []);

  if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">판매자 관리</h1>
              <p className="text-gray-600 mt-1">판매자 계정을 관리하고 승인/거절 및 상태를 변경할 수 있습니다</p>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 판매자</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">활성 판매자</p>
                  <p className="text-2xl font-bold text-green-600">{totalStats.active.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <UserX className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">정지 판매자</p>
                  <p className="text-2xl font-bold text-red-600">{totalStats.inactive.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">승인 판매자</p>
                  <p className="text-2xl font-bold text-blue-600">{totalStats.approved.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">승인 대기</p>
                  <p className="text-2xl font-bold text-yellow-600">{totalStats.pending.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="이름 또는 이메일로 검색하세요..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div className="lg:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={status}
                  onChange={handleStatusChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white transition-all"
                >
                  <option value="">전체 승인 상태</option>
                  <option value="승인">승인</option>
                  <option value="승인처리전">승인처리전</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
            
            <div className="lg:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={activeFilter}
                  onChange={handleActiveFilterChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white transition-all"
                >
                  <option value="">전체 활성 상태</option>
                  <option value="active">활성</option>
                  <option value="inactive">정지</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* 판매자 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading && filteredSellers.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">판매자 정보를 불러오는 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="text-red-500 text-lg font-semibold mb-2">오류가 발생했습니다</div>
                <div className="text-gray-600 mb-6">{error}</div>
                <button
                  onClick={fetchSellers}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  다시 시도
                </button>
              </div>
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 text-lg font-medium mb-2">판매자가 없습니다</div>
                <div className="text-gray-400 text-sm">
                  {search || status || activeFilter ? '검색 조건을 변경해보세요.' : '등록된 판매자가 없습니다.'}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 데스크탑 테이블 */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">판매자 정보</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">이메일</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">승인 상태</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">활성 상태</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSellers.map((seller) => (
                      <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={seller.image || '/images/default-profile.svg'}
                              alt={`${seller.name}의 프로필`}
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/images/placeholder.png';
                              }}
                            />
                            <div>
                              <div className="font-semibold text-gray-900">{seller.name}</div>
                              <div className="text-sm text-gray-500">ID: {seller.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">{seller.email}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                            seller.is_approved
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {seller.is_approved ? '승인' : '승인처리전'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                            seller.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {seller.is_active ? '활성' : '정지'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col gap-2">
                            {!seller.is_approved && (
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => handleApproval(seller, true)}
                                  disabled={updatingId === seller.id}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => handleApproval(seller, false)}
                                  disabled={updatingId === seller.id}
                                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
                                >
                                  거절
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => handleToggleActive(seller)}
                              disabled={updatingId === seller.id}
                              className={`px-3 py-1 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                                seller.is_active
                                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
                                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
                              } ${updatingId === seller.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {updatingId === seller.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                                  처리중
                                </>
                              ) : (
                                seller.is_active ? '정지' : '복구'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 모바일 카드 */}
              <div className="lg:hidden divide-y divide-gray-100">
                {filteredSellers.map((seller) => (
                  <div key={seller.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={seller.image || '/images/default-profile.svg'}
                        alt={`${seller.name}의 프로필`}
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/placeholder.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 truncate">{seller.name}</h3>
                            <p className="text-sm text-gray-500">ID: {seller.id}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              seller.is_approved
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {seller.is_approved ? '승인' : '승인처리전'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              seller.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {seller.is_active ? '활성' : '정지'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 truncate">{seller.email}</p>
                        <div className="flex flex-wrap gap-2">
                          {!seller.is_approved && (
                            <>
                              <button
                                onClick={() => handleApproval(seller, true)}
                                disabled={updatingId === seller.id}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => handleApproval(seller, false)}
                                disabled={updatingId === seller.id}
                                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
                              >
                                거절
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleActive(seller)}
                            disabled={updatingId === seller.id}
                            className={`px-3 py-1 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                              seller.is_active
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
                                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
                            } ${updatingId === seller.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {updatingId === seller.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                                처리중
                              </>
                            ) : (
                              seller.is_active ? '정지' : '복구'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Object.assign(AdminSellersPage, { pageTitle: '판매자 관리' }); 