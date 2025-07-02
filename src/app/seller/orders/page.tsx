'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSellerOrders } from '@/service/seller/sellerOrderService';
import { SellerOrderResponse } from '@/types/seller/sellerorder/sellerOrder';
import SellerHeader from '@/components/seller/SellerHeader';
import SellerLayout from '@/components/layouts/SellerLayout';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import { PageResponseForOrder } from '@/types/seller/page/pageResponseForOrder';
import { Armchair, Truck, CheckCircle, Clock, Eye, Search, ShoppingCart } from 'lucide-react';

// 그룹핑된 주문 타입 정의
interface GroupedOrder {
  orderId: number;
  orderedAt: string;
  customerName: string;
  deliveryStatus: string;
  products: Array<{ productName: string; quantity: number }>;
  totalQuantity: number;
  productCount: number;
}

export default function SellerOrderListPage() {
  const checking = useSellerAuthGuard();
  const [orders, setOrders] = useState<SellerOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (checking) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res: PageResponseForOrder<SellerOrderResponse> = await getSellerOrders();
        setOrders(res.content || []);
        setError(null);
      } catch (err) {
        console.error('주문 목록 조회 실패', err);
        setError('주문 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [checking]);

  // 🔥 orderId 기준으로 주문 그룹핑
  const groupOrdersByOrderId = (orders: SellerOrderResponse[]) => {
    const grouped = orders.reduce((acc: any, order) => {
      if (!acc[order.orderId]) {
        acc[order.orderId] = {
          orderId: order.orderId,
          orderedAt: order.orderedAt,
          customerName: order.customerName,
          deliveryStatus: order.deliveryStatus,
          products: [],
          totalQuantity: 0,
        };
      }
      
      acc[order.orderId].products.push({
        name: order.productName,
        quantity: order.quantity
      });
      acc[order.orderId].totalQuantity += order.quantity;
      
      return acc;
    }, {});
    
    return Object.values(grouped);
  };

  const groupedOrders = groupOrdersByOrderId(orders);
  const totalOrders = groupedOrders.length;
  const preparingOrders = groupedOrders.filter((order: any) => order.deliveryStatus === 'DELIVERY_PREPARING').length;
  const inProgressOrders = groupedOrders.filter((order: any) => order.deliveryStatus === 'DELIVERY_IN_PROGRESS').length;
  const completedOrders = groupedOrders.filter((order: any) => order.deliveryStatus === 'DELIVERY_COMPLETED').length;

  const filteredOrders = groupedOrders.filter((order: any) => {
    const matchesKeyword = searchKeyword === '' || 
      order.customerName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      order.products.some((product: any) => product.name.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      order.orderId.toString().includes(searchKeyword);
    const matchesStatus = statusFilter === '' || order.deliveryStatus === statusFilter;
    return matchesKeyword && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INIT':
        return <span className="px-2 py-1 rounded text-xs font-bold bg-[#f3f4f6] text-[#374151]">주문 접수</span>;
      case 'DELIVERY_PREPARING':
        return <span className="px-2 py-1 rounded text-xs font-bold bg-[#f3f4f6] text-[#374151]">배송 준비</span>;
      case 'DELIVERY_IN_PROGRESS':
        return <span className="px-2 py-1 rounded text-xs font-bold bg-[#f3f4f6] text-[#374151]">배송 중</span>;
      case 'DELIVERY_COMPLETED':
        return <span className="px-2 py-1 rounded text-xs font-bold bg-[#f3f4f6] text-[#374151]">배송 완료</span>;
      default:
        return <span className="px-2 py-1 rounded text-xs font-bold bg-[#f3f4f6] text-[#374151]">{status}</span>;
    }
  };

  if (checking || loading) {
    return (
      <div className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6b7280] mx-auto mb-4"></div>
          <p className="text-[#374151]">주문 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-1">
        <SellerLayout>
          <div className="w-full h-full px-4 py-8">
            <h1 className="text-xl md:text-2xl font-bold mb-6 text-[#374151]">주문 관리</h1>
            <p className="text-sm text-[#6b7280] mb-6">주문번호 기준으로 그룹핑된 주문 목록입니다. 하나의 주문에 여러 상품이 포함될 수 있습니다.</p>
            
            {/* 상단 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <ShoppingCart className="w-8 h-8 text-[#6b7280]" />
                  <span className="text-[#374151] text-sm font-semibold">총 주문 (그룹핑)</span>
                </div>
                <div className="text-2xl font-bold text-[#374151]">{totalOrders}건</div>
                <div className="text-xs text-[#6b7280] mt-1">주문번호 기준 그룹핑</div>
              </section>
              <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-8 h-8 text-[#6b7280]" />
                  <span className="text-[#374151] text-sm font-semibold">대기 중</span>
                </div>
                <div className="text-2xl font-bold text-[#374151]">{preparingOrders}건</div>
              </section>
              <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="w-8 h-8 text-[#6b7280]" />
                  <span className="text-[#374151] text-sm font-semibold">배송 중</span>
                </div>
                <div className="text-2xl font-bold text-[#374151]">{inProgressOrders}건</div>
              </section>
              <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-8 h-8 text-[#6b7280]" />
                  <span className="text-[#374151] text-sm font-semibold">완료</span>
                </div>
                <div className="text-2xl font-bold text-[#374151]">{completedOrders}건</div>
              </section>
            </div>
            
            {/* 검색/필터 영역 */}
            <div className="bg-[#f3f4f6] p-4 md:p-6 rounded-lg shadow-sm border-2 border-[#d1d5db] mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="주문번호 또는 상품명으로 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="flex-1 border-2 border-[#d1d5db] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d1d5db] bg-[#f3f4f6] text-[#374151]"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border-2 border-[#d1d5db] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d1d5db] bg-[#f3f4f6] text-[#374151]"
                >
                  <option value="">전체 상태</option>
                  <option value="INIT">주문 접수</option>
                  <option value="DELIVERY_PREPARING">배송 준비</option>
                  <option value="DELIVERY_IN_PROGRESS">배송 중</option>
                  <option value="DELIVERY_COMPLETED">배송 완료</option>
                </select>
              </div>
            </div>
            
            {/* 주문 목록 */}
            {error ? (
              <div className="bg-[#fbeee0] border border-[#6b7280] rounded-lg p-4">
                <p className="text-[#b94a48]">{error}</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-[#f3f4f6] border border-[#6b7280] rounded-lg p-8 text-center">
                <Armchair className="w-12 h-12 text-[#6b7280] mx-auto mb-4" />
                <p className="text-[#6b7280] text-lg">주문이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-[#f3f4f6] rounded-lg shadow-sm border border-[#d1d5db]">
                <table className="min-w-full divide-y divide-[#d1d5db]">
                  <thead className="bg-[#f3f4f6]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider">주문번호</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider">주문일시</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider">고객명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider">상품정보</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider">총 수량</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#374151] uppercase tracking-wider">배송상태</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#374151] uppercase tracking-wider">액션</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#f3f4f6] divide-y divide-[#d1d5db]">
                    {filteredOrders.map((order: any) => (
                      <tr key={order.orderId} className="hover:bg-[#e5e7eb] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-[#374151]">#{order.orderId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151]">
                          {new Date(order.orderedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-[#374151]">{order.customerName}</td>
                        <td className="px-6 py-4 text-[#374151]">
                          {order.products.length === 1 ? (
                            <span>{order.products[0].name}</span>
                          ) : (
                            <div className="space-y-1">
                              <span className="font-medium">{order.products[0].name}</span>
                              <div className="text-xs text-[#6b7280]">
                                외 {order.products.length - 1}개 상품
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{order.totalQuantity}개</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.deliveryStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => router.push(`/seller/orders/${order.orderId}`)}
                            className="inline-flex items-center gap-1 bg-[#d1d5db] text-[#374151] px-3 py-1.5 rounded hover:bg-[#e5e7eb] hover:text-[#374151] text-sm"
                          >
                            <Eye className="w-4 h-4" /> 상세 보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SellerLayout>
      </main>
    </div>
  );
}
