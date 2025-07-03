"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/apiClient';
import { Users, Search, Filter, RefreshCw, UserCheck, UserX, ChevronDown } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  image?: string;
}

interface Seller {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  image?: string;
}

interface ApiResponse {
  data: {
    data: {
      content: Customer[];
      totalElements: number;
      totalPages: number;
      number: number;
      last: boolean;
    };
  };
}

const CustomerListPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  const router = useRouter();

  // 인증 체크
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
      router.replace('/admin/login');
      return;
    }
  }, [router]);

  // 고객 통계 데이터 로딩
  const fetchTotalStats = async () => {
    try {
      // 고객 통계만 가져오기
      const customerResponse = await adminApi.get('/admin/users?userType=CUSTOMER&page=0&size=1000');
      const customerData = customerResponse.data.data.content || [];
      
      // 고객 통계 계산
      const totalActive = customerData.filter((user: any) => 
        user.is_active === true || user.is_active === 'true' || user.is_active === 1 ||
        user.isActive === true || user.isActive === 'true' || user.isActive === 1
      ).length;
      
      setTotalStats({
        total: customerData.length,
        active: totalActive,
        inactive: customerData.length - totalActive
      });
    } catch (err) {
      console.error('고객 통계 로딩 실패:', err);
    }
  };

  // 데이터 로딩
  const fetchCustomers = async (page = 0, reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(0);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const params = new URLSearchParams({
        userType: 'CUSTOMER',
        page: page.toString(),
        size: '20',
      });
      
      if (search.trim()) params.append('searchTerm', search.trim());
      if (status) params.append('isActive', status === 'Active' ? 'true' : 'false');

      const response: ApiResponse = await adminApi.get(`/admin/users?${params.toString()}`);
      
      const customersWithBoolean = (response.data.data.content || []).map((c: any) => ({
        ...c,
        is_active: Boolean(c.is_active === true || c.is_active === 'true' || c.is_active === 1 || c.isActive === true || c.isActive === 'true' || c.isActive === 1)
      }));
      
      if (reset) {
        setCustomers(customersWithBoolean);
      } else {
        setCustomers(prev => [...prev, ...customersWithBoolean]);
      }
      
      setTotalElements(response.data.data.totalElements || 0);
      setHasMore(!response.data.data.last);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 더 불러오기 버튼 핸들러
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchCustomers(currentPage + 1, false);
    }
  };

  useEffect(() => {
    fetchCustomers(0, true);
    fetchTotalStats(); // 전체 통계도 함께 로딩
  }, [search, status]);

  // 상태 토글 핸들러
  const handleToggleActive = async (customer: Customer) => {
    try {
      setUpdatingId(customer.id);
      
      await adminApi.put(`/admin/users/customers/${customer.id}/status`, {
        isActive: !customer.is_active
      });
      
      setCustomers(prev =>
        prev.map(c =>
          c.id === customer.id ? { ...c, is_active: !c.is_active } : c
        )
      );
      
      // 상태 변경 후 전체 통계 다시 로딩
      fetchTotalStats();
    } catch (err: any) {
      alert(`상태 변경 실패: ${err?.response?.data?.message || err?.message || '알 수 없는 오류'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // 현재 페이지 고객 통계 (필터링된 결과)
  const currentPageStats = {
    total: totalElements,
    active: customers.filter(c => c.is_active).length,
    inactive: customers.filter(c => !c.is_active).length
  };

  if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">고객 관리</h1>
              <p className="text-gray-600 mt-1">고객 계정을 관리하고 상태를 변경할 수 있습니다</p>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 고객</p>
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
                  <p className="text-sm font-medium text-gray-600">활성 고객</p>
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
                  <p className="text-sm font-medium text-gray-600">정지 고객</p>
                  <p className="text-2xl font-bold text-red-600">{totalStats.inactive.toLocaleString()}</p>
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
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div className="lg:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white transition-all"
                >
                  <option value="">전체 상태</option>
                  <option value="Active">활성 고객</option>
                  <option value="Blocked">정지 고객</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
            

          </div>
        </div>

        {/* 고객 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading && customers.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">고객 정보를 불러오는 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="text-red-500 text-lg font-semibold mb-2">오류가 발생했습니다</div>
                <div className="text-gray-600 mb-6">{error}</div>
                <button
                  onClick={() => fetchCustomers(0, true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  다시 시도
                </button>
              </div>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 text-lg font-medium mb-2">고객이 없습니다</div>
                <div className="text-gray-400 text-sm">
                  {search || status ? '검색 조건을 변경해보세요.' : '등록된 고객이 없습니다.'}
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">고객 정보</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">이메일</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">상태</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={customer.image || '/images/default-profile.svg'}
                              alt={`${customer.name}의 프로필`}
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/images/placeholder.png';
                              }}
                            />
                            <div>
                              <div className="font-semibold text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">ID: {customer.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">{customer.email}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                            customer.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.is_active ? '활성' : '정지'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleActive(customer)}
                            disabled={updatingId === customer.id}
                            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                              customer.is_active
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
                                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
                            } ${updatingId === customer.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {updatingId === customer.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                처리중
                              </>
                            ) : (
                              customer.is_active ? '정지' : '복구'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 모바일 카드 */}
              <div className="lg:hidden divide-y divide-gray-100">
                {customers.map((customer) => (
                  <div key={customer.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={customer.image || '/images/default-profile.svg'}
                        alt={`${customer.name}의 프로필`}
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/placeholder.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                            <p className="text-sm text-gray-500">ID: {customer.id}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            customer.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.is_active ? '활성' : '정지'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 truncate">{customer.email}</p>
                        <button
                          onClick={() => handleToggleActive(customer)}
                          disabled={updatingId === customer.id}
                          className={`w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                            customer.is_active
                              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
                              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white'
                          } ${updatingId === customer.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {updatingId === customer.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              처리중
                            </>
                          ) : (
                            customer.is_active ? '정지' : '복구'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 더 불러오기 버튼 */}
              {hasMore && (
                <div className="flex justify-center py-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        더 불러오는 중...
                      </>
                    ) : (
                      <>더 불러오기 ({customers.length}/{totalElements})</>
                    )}
                  </button>
                </div>
              )}

              {/* 모든 데이터 로드 완료 */}
              {!hasMore && customers.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  모든 고객을 불러왔습니다 ({customers.length}명)
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Object.assign(CustomerListPage, { pageTitle: '고객 관리' });