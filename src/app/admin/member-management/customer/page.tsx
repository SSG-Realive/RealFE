"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/apiClient';
import { Users, Search, Filter, RefreshCw, UserCheck, UserX, ChevronDown, AlertTriangle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface Penalty {
  id: number;
  customerId: number;
  points: number;
  reason: string;
  createdAt: string;
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
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [penaltySort, setPenaltySort] = useState("all");
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

  // 패널티 데이터 로딩
  const fetchPenalties = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
      const response = await adminApi.get('/admin/penalties?userType=CUSTOMER&page=0&size=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const penaltiesData = response.data?.data?.content || response.data?.content || [];
      setPenalties(penaltiesData);
    } catch (err) {
      console.error('패널티 데이터 로딩 실패:', err);
      setPenalties([]);
    }
  };

  // 고객의 총 패널티 점수 계산
  const getCustomerPenaltyPoints = (customerId: number) => {
    const customerPenalties = penalties.filter(p => p.customerId === customerId);
    return customerPenalties.reduce((total, penalty) => total + (penalty.points || 0), 0);
  };

  // 패널티 뱃지 컴포넌트
  const getPenaltyBadge = (customerId: number) => {
    const totalPoints = getCustomerPenaltyPoints(customerId);
    
    if (totalPoints === 0) {
      return <Badge variant="secondary">패널티 없음</Badge>;
    } else if (totalPoints <= 20) {
      return <Badge variant="warning">{totalPoints}점</Badge>;
    } else if (totalPoints <= 50) {
      return <Badge variant="destructive">{totalPoints}점</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-red-800">{totalPoints}점</Badge>;
    }
  };

  // 패널티 점수에 따른 고객 필터링 및 정렬
  const getFilteredAndSortedCustomers = () => {
    // 서버에서 이미 필터링된 데이터를 받아오므로, 클라이언트에서는 필터링만 수행
    let filtered = [...customers];

    // 패널티 필터링 (클라이언트 사이드)
    if (penaltySort === 'has') {
      filtered = filtered.filter(c => getCustomerPenaltyPoints(c.id) > 0);
    } else if (penaltySort === 'none') {
      filtered = filtered.filter(c => getCustomerPenaltyPoints(c.id) === 0);
    }

    return filtered;
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
      if (status !== 'all') params.append('isActive', status === 'Active' ? 'true' : 'false');
      // 패널티 정렬은 클라이언트에서 처리하므로 서버에 전송하지 않음

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

  // 초기 로딩
  useEffect(() => {
    fetchCustomers(0, true);
    fetchTotalStats();
    fetchPenalties();
  }, []);

  // 검색과 상태 필터 변경 시 데이터 다시 로딩
  useEffect(() => {
    fetchCustomers(0, true);
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

  // 상태 뱃지 shadcn 적용
  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "success" : "destructive"}>{isActive ? "활성" : "비활성"}</Badge>
  );

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">패널티 고객</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {customers.filter(c => getCustomerPenaltyPoints(c.id) > 0).length.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 검색/필터 영역 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <Input
                type="text"
                placeholder="이름, 이메일로 검색"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">활성 상태</label>
              <Select value={status} onValueChange={(value) => setStatus(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="활성 상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="Active">활성 고객</SelectItem>
                  <SelectItem value="Inactive">비활성 고객</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">패널티 상태</label>
              <Select value={penaltySort} onValueChange={(value) => setPenaltySort(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="패널티 상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 고객</SelectItem>
                  <SelectItem value="has">패널티 있음</SelectItem>
                  <SelectItem value="none">패널티 없음</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={() => fetchCustomers(0, true)} 
                disabled={loading}
                className="w-full"
              >
                새로고침
              </Button>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">고객 정보를 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">패널티</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredAndSortedCustomers().map(customer => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">{customer.name?.charAt(0) || '?'}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getPenaltyBadge(customer.id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(customer.is_active)}</td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          size="sm"
                          variant={customer.is_active ? "destructive" : "success"}
                          onClick={() => handleToggleActive(customer)}
                          disabled={updatingId === customer.id}
                        >
                          {customer.is_active ? <UserX className="w-4 h-4 mr-1" /> : <UserCheck className="w-4 h-4 mr-1" />}
                          {customer.is_active ? "비활성화" : "활성화"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {customers.length === 0 && (
                <div className="text-center py-12 text-gray-500">데이터가 없습니다</div>
              )}
            </div>
          )}
        </div>

        {/* 더 불러오기 버튼 */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "불러오는 중..." : "더 불러오기"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Object.assign(CustomerListPage, { pageTitle: '고객 관리' });