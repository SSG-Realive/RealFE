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
    const [totalElements, setTotalElements] = useState(0);
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
                console.log('[QnA 페이지] API 호출 시작');
                
                const response = await getCustomerQnaList({ page, size: 10 });
                console.log('[QnA 페이지] === API 응답 상세 분석 ===');
                console.log('전체 응답:', response);
                console.log('응답 타입:', typeof response);
                console.log('content 존재:', !!response?.content);
                console.log('content 배열 길이:', response?.content?.length);
                
                if (response?.content) {
                    console.log('첫 번째 아이템 구조:', response.content[0]);
                    console.log('첫 번째 아이템 키들:', Object.keys(response.content[0] || {}));
                    
                    // 각 아이템의 구조 분석
                    response.content.forEach((item: any, index: number) => {
                        console.log(`아이템 ${index}:`, {
                            hasQna: !!item.qna,
                            hasProductSummary: !!item.productSummary,
                            qnaKeys: item.qna ? Object.keys(item.qna) : [],
                            productKeys: item.productSummary ? Object.keys(item.productSummary) : [],
                            directKeys: Object.keys(item)
                        });
                    });
                }
                
                setQnaList(response?.content || []);
                setTotalPages(response?.totalPages || 0);
                setTotalElements(response?.totalElements || 0);
                setError('');
                console.log('[QnA 페이지] 데이터 설정 완료');
            } catch (err: any) {
                console.error('=== 고객 QnA 목록 조회 실패 ===');
                console.error('에러 객체:', err);
                console.error('에러 메시지:', err.message);
                console.error('응답 상태:', err.response?.status);
                console.error('응답 데이터:', err.response?.data);
                
                let errorMessage = '고객 QnA 데이터를 불러오는 데 실패했습니다.';
                
                if (err.response?.status === 500) {
                    if (err.response?.data?.message?.includes('Duplicate key')) {
                        errorMessage = '데이터 중복 오류가 발생했습니다. 백엔드팀에 문의해주세요. (Duplicate key error)';
                    } else {
                        errorMessage = '서버 내부 오류가 발생했습니다. 백엔드팀에 문의해주세요.';
                    }
                } else if (err.response?.status === 401) {
                    errorMessage = '로그인이 필요합니다.';
                } else if (err.response?.status === 403) {
                    errorMessage = '접근 권한이 없습니다.';
                } else if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                }
                
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [page, checking]);

    // 통계 계산 - 전체 데이터는 totalElements를 사용하고, 현재 페이지 데이터로 비율 계산
    const totalQna = totalElements; // 전체 QnA 수
    const currentPageAnswered = qnaList.filter((item: any) => {
        const qna = item.qna || item;
        return qna.isAnswered || qna.answered === true || qna.answered === 'true';
    }).length;
    const currentPageUnanswered = qnaList.filter((item: any) => {
        const qna = item.qna || item;
        return !(qna.isAnswered || qna.answered === true || qna.answered === 'true');
    }).length;
    
    // 전체 비율 계산 (백엔드에서 추가 API가 필요하지만, 현재는 현재 페이지 기준으로 추정)
    const answerRate = qnaList.length > 0 ? ((currentPageAnswered / qnaList.length) * 100).toFixed(1) : '0.0';

    // 필터링된 QnA 목록
    const filteredQnaList = qnaList.filter((item: any) => {
        const qna = item.qna || item; // qna 객체 추출
        const matchesKeyword = searchKeyword === '' || 
            (qna.title && qna.title.toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (qna.content && qna.content.toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (qna.customerName && qna.customerName.toLowerCase().includes(searchKeyword.toLowerCase())) ||
            (qna.productName && qna.productName.toLowerCase().includes(searchKeyword.toLowerCase()));
        
        const isAnswered = qna.isAnswered || qna.answered === true || qna.answered === 'true';
        const matchesStatus = statusFilter === '' || 
            (statusFilter === 'answered' && isAnswered) ||
            (statusFilter === 'unanswered' && !isAnswered);
        
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
                            <div className="text-2xl font-bold text-[#374151]">{currentPageUnanswered}건</div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-8 h-8 text-[#6b7280]" />
                                <span className="text-[#374151] text-sm font-semibold">답변 완료</span>
                            </div>
                            <div className="text-2xl font-bold text-[#374151]">{currentPageAnswered}건</div>
                        </section>
                        <section className="bg-[#f3f4f6] rounded-xl shadow-xl border-2 border-[#d1d5db] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <Percent className="w-8 h-8 text-[#6b7280]" />
                                <span className="text-[#374151] text-sm font-semibold">답변률</span>
                            </div>
                            <div className="text-2xl font-bold text-[#374151]">{answerRate}%</div>
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
                            <p className="text-[#6b7280] text-sm mt-2">
                                {error ? '서버 문제로 데이터를 불러올 수 없습니다.' : '등록된 고객 문의가 없습니다.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-[#f3f4f6] rounded-lg shadow-sm border border-[#d1d5db]">
                            <table className="min-w-full divide-y divide-[#d1d5db]">
                                <thead className="bg-[#f3f4f6]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">고객명</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">상품명</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">제목</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">상태</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">등록일</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-[#6b7280] uppercase tracking-wider">액션</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#f3f4f6] divide-y divide-[#d1d5db]">
                                    {filteredQnaList.map((item: any, idx) => {
                                        // 백엔드 응답 구조에 맞게 qna와 productSummary 추출
                                        const qna = item.qna || item;
                                        const productSummary = item.productSummary || null;
                                        const isAnswered = qna.isAnswered || qna.answered === true || qna.answered === 'true';
                                        
                                        return (
                                        <tr key={qna.id || idx} className="hover:bg-[#e5e7eb] transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{qna.customerName || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{productSummary?.name || qna.productName || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{qna.title || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-[#374151]">
                                                    {getStatusBadge(isAnswered)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-[#374151]">{qna.createdAt || '-'}</td>
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