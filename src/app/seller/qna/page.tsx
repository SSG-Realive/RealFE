'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomerQnaList } from '@/service/seller/customerQnaService';
import { CustomerQnaResponse, CustomerQnaListResponse } from '@/types/seller/customerqna/customerQnaResponse';
import SellerLayout from '@/components/layouts/SellerLayout';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import SellerHeader from '@/components/seller/SellerHeader';
import { MessageCircle, CheckCircle, Clock, Plus, Eye, Search, Filter, User, Package, Percent } from 'lucide-react';

export default function SellerQnaPage() {
    const checking = useSellerAuthGuard();

    const router = useRouter();

    const [qnaList, setQnaList] = useState<CustomerQnaResponse[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    useEffect(() => {
        if (checking) return;
        
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await getCustomerQnaList({ page, size: 10 });
                setQnaList(res.content || []);
                setTotalPages(res.totalPages || 1);
                setError(null);
            } catch (err) {
                console.error('고객 QnA 목록 조회 실패:', err);
                setError('고객 QnA 데이터를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [page, checking]);

    // 통계 계산
    const totalQna = qnaList.length;
    const answeredQna = qnaList.filter(qna => qna.answered === true || qna.answered === 'true').length;
    const unansweredQna = qnaList.filter(qna => !(qna.answered === true || qna.answered === 'true')).length;

    // 필터링된 QnA 목록
    const filteredQnaList = qnaList.filter(qna => {
        const matchesKeyword = searchKeyword === '' || 
            qna.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            qna.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            qna.customerName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            qna.productName.toLowerCase().includes(searchKeyword.toLowerCase());
        
        const matchesStatus = statusFilter === '' || 
            (statusFilter === 'answered' && qna.isAnswered) ||
            (statusFilter === 'unanswered' && !qna.isAnswered);
        
        return matchesKeyword && matchesStatus;
    });

    const getStatusBadge = (isAnswered: boolean) => {
        return isAnswered ? (
            <span className="px-2 py-1 rounded text-xs font-bold bg-[#f3f4f6] text-[#374151] flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                답변 완료
            </span>
        ) : (
            <span className="px-2 py-1 rounded text-xs font-bold bg-[#f3f4f6] text-[#374151] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                미답변
            </span>
        );
    };

    if (checking || loading) {
        return (
            <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bfa06a] mx-auto mb-4"></div>
                    <p className="text-[#5b4636]">고객 문의 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="hidden">
                <SellerHeader toggleSidebar={toggleSidebar} />
            </div>
            <SellerLayout>
                <div className="flex-1 w-full h-full px-4 py-8">
                    <h1 className="text-xl md:text-2xl font-bold mb-6 text-[#5b4636]">고객 문의 관리</h1>

                    {/* 상단 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <MessageCircle className="w-8 h-8 text-[#6b7280]" />
                                <span className="text-[#374151] text-sm font-semibold">총 문의</span>
                            </div>
                            <div className="text-2xl font-bold text-[#374151]">{totalQna}건</div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-8 h-8 text-[#6b7280]" />
                                <span className="text-[#374151] text-sm font-semibold">답변 대기</span>
                            </div>
                            <div className="text-2xl font-bold text-[#374151]">{unansweredQna}건</div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-8 h-8 text-[#6b7280]" />
                                <span className="text-[#374151] text-sm font-semibold">답변 완료</span>
                            </div>
                            <div className="text-2xl font-bold text-[#374151]">{answeredQna}건</div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <Percent className="w-8 h-8 text-[#6b7280]" />
                                <span className="text-[#374151] text-sm font-semibold">답변률</span>
                            </div>
                            <div className="text-2xl font-bold text-[#374151]">{((answeredQna / totalQna) * 100).toFixed(2)}%</div>
                        </section>
                    </div>

                    {/* 검색 및 필터 */}
                    <div className="bg-[#f3f4f6] p-4 md:p-6 rounded-lg shadow-sm border-2 border-[#d1d5db] mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                        <input
                            type="text"
                                    placeholder="제목 또는 내용으로 검색..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-2 border-[#d1d5db] rounded-lg bg-[#f3f4f6] text-[#374151] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#d1d5db]"
                        />
                            </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                                className="border-2 border-[#d1d5db] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d1d5db] bg-[#f3f4f6] text-[#374151]"
                        >
                            <option value="">전체 상태</option>
                            <option value="answered">답변 완료</option>
                            <option value="unanswered">미답변</option>
                        </select>
                        </div>
                    </div>

                    {/* QnA 목록 */}
                    {error ? (
                        <div className="bg-[#fbeee0] border border-[#bfa06a] rounded-lg p-4">
                            <p className="text-[#b94a48]">{error}</p>
                        </div>
                    ) : filteredQnaList.length === 0 ? (
                        <div className="bg-[#f3f4f6] border border-[#d1d5db] rounded-lg p-8 text-center">
                            <MessageCircle className="w-12 h-12 text-[#6b7280] mx-auto mb-4" />
                            <p className="text-[#374151] text-lg">고객 문의가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-[#f3f4f6] rounded-lg shadow-sm border border-[#d1d5db]">
                            <table className="min-w-full divide-y divide-[#d1d5db]">
                                <thead className="bg-[#f3f4f6]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">고객/상품</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">제목</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">상태</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">등록일</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">답변일</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-[#6b7280] uppercase tracking-wider">액션</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#f3f4f6] divide-y divide-[#d1d5db]">
                                    {filteredQnaList.map((item: any, idx) => {
                                        const qna = item.qna;
                                        return (
                                        <tr key={qna.id || idx} className="hover:bg-[#e5e7eb] transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{qna.customerName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{qna.productName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{qna.title}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{qna.isAnswered ? "답변 완료" : "미답변"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{qna.createdAt}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => router.push(`/seller/qna/${qna.id}`)}
                                                        className="inline-flex items-center gap-1 bg-[#d1d5db] text-[#374151] px-3 py-1.5 rounded hover:bg-[#e5e7eb] hover:text-[#374151] text-sm transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" /> 상세 보기
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                            <button
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                    className="px-3 py-2 border border-[#d1d5db] rounded bg-[#f3f4f6] text-[#374151] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d1d5db] hover:text-[#6b7280]"
                            >
                                이전
                            </button>
                                <span className="px-3 py-2 text-[#374151]">
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                    disabled={page === totalPages - 1}
                                    className="px-3 py-2 border border-[#d1d5db] rounded bg-[#f3f4f6] text-[#374151] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d1d5db] hover:text-[#6b7280]"
                            >
                                다음
                            </button>
                            </div>
                        </div>
                    )}
                </div>
            </SellerLayout>
        </>
    );
}