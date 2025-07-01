'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getQnaList } from '@/service/seller/sellerQnaService';
import { SellerQnaResponse, SellerQnaListResponse } from '@/types/seller/sellerqna/sellerQnaResponse';
import SellerLayout from '@/components/layouts/SellerLayout';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import SellerHeader from '@/components/seller/SellerHeader';
import { MessageCircle, CheckCircle, Clock, Plus, Eye, Search, Filter, Edit, Trash2 } from 'lucide-react';

export default function SellerQnaListPage() {
    const checking = useSellerAuthGuard();
    const router = useRouter();

    const [qnaList, setQnaList] = useState<SellerQnaResponse[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // QnA 목록 조회
    const fetchQnaList = async (pageNum = 0) => {
        try {
            setLoading(true);
            setError(null);
            
            const searchParams: Record<string, any> = {
                page: pageNum,
                size: 10,
                ...(searchKeyword && { search: searchKeyword }),
                ...(statusFilter && { status: statusFilter })
            };

            const response: SellerQnaListResponse = await getQnaList(searchParams);
            
            // isActive가 true인 QnA만 필터링
            const activeQnaList = response.content.filter(qna => qna.isActive);
            setQnaList(activeQnaList);
            setTotalPages(response.totalPages || 1);
            setTotalElements(response.totalElements || 0);
            setPage(pageNum);
        } catch (err: any) {
            console.error('QnA 목록 조회 실패:', err);
            setError('QnA 목록을 불러오는데 실패했습니다.');
            setQnaList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!checking) {
            fetchQnaList(0);
        }
    }, [checking]);

    // 검색 처리
    const handleSearch = () => {
        fetchQnaList(0);
    };

    // 상태별 통계 계산
    const totalQna = qnaList.length;
    const answeredQna = qnaList.filter(qna => qna.isAnswered).length;
    const unansweredQna = totalQna - answeredQna;
    const answerRate = totalQna > 0 ? ((answeredQna / totalQna) * 100).toFixed(1) : '0.0';

    // 필터링된 QnA 목록
    const filteredQnaList = qnaList.filter((qna) => {
        const matchesKeyword = searchKeyword === '' || 
            qna.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            qna.content.toLowerCase().includes(searchKeyword.toLowerCase());
        
        const matchesStatus = statusFilter === '' || 
            (statusFilter === 'answered' && qna.isAnswered) ||
            (statusFilter === 'unanswered' && !qna.isAnswered);
        
        return matchesKeyword && matchesStatus;
    });

    const getStatusBadge = (isAnswered: boolean) => {
        return isAnswered ? (
            <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                답변 완료
            </span>
        ) : (
            <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-800 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                미답변
            </span>
        );
    };

    if (checking) {
        return (
            <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bfa06a] mx-auto mb-4"></div>
                    <p className="text-[#5b4636]">인증 확인 중...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="hidden">
                <SellerHeader />
            </div>
            <SellerLayout>
                <div className="flex-1 w-full h-full px-4 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl md:text-2xl font-bold text-[#5b4636]">관리자 문의 관리</h1>
                        <button
                            onClick={() => router.push('/seller/qna/new')}
                            className="inline-flex items-center gap-2 bg-[#bfa06a] text-white px-4 py-2 rounded-lg hover:bg-[#a89053] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            새 문의 작성
                        </button>
                    </div>

                    {/* 상단 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <section className="bg-[#f5f1eb] rounded-xl shadow-xl border-2 border-[#d6ccc2] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <MessageCircle className="w-8 h-8 text-[#a89f91]" />
                                <span className="text-[#5b4636] text-sm font-semibold">총 문의</span>
                            </div>
                            <div className="text-2xl font-bold text-[#5b4636]">{totalQna}건</div>
                        </section>
                        <section className="bg-[#f5f1eb] rounded-xl shadow-xl border-2 border-[#d6ccc2] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-8 h-8 text-[#a89f91]" />
                                <span className="text-[#5b4636] text-sm font-semibold">답변 대기</span>
                            </div>
                            <div className="text-2xl font-bold text-[#5b4636]">{unansweredQna}건</div>
                        </section>
                        <section className="bg-[#f5f1eb] rounded-xl shadow-xl border-2 border-[#d6ccc2] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-8 h-8 text-[#a89f91]" />
                                <span className="text-[#5b4636] text-sm font-semibold">답변 완료</span>
                            </div>
                            <div className="text-2xl font-bold text-[#5b4636]">{answeredQna}건</div>
                        </section>
                        <section className="bg-[#f5f1eb] rounded-xl shadow-xl border-2 border-[#d6ccc2] flex flex-col justify-center items-center p-6 min-h-[140px] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <Filter className="w-8 h-8 text-[#a89f91]" />
                                <span className="text-[#5b4636] text-sm font-semibold">답변률</span>
                            </div>
                            <div className="text-2xl font-bold text-[#5b4636]">{answerRate}%</div>
                        </section>
                    </div>

                    {/* 검색 및 필터 */}
                    <div className="bg-[#f5f1eb] p-4 md:p-6 rounded-lg shadow-sm border-2 border-[#d6ccc2] mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a89f91]" />
                                <input
                                    type="text"
                                    placeholder="제목 또는 내용으로 검색..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-2 border-[#d6ccc2] rounded-lg bg-white text-[#5b4636] placeholder-[#a89f91] focus:outline-none focus:ring-2 focus:ring-[#bfa06a]"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border-2 border-[#d6ccc2] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa06a] bg-white text-[#5b4636]"
                            >
                                <option value="">전체 상태</option>
                                <option value="answered">답변 완료</option>
                                <option value="unanswered">미답변</option>
                            </select>
                            <button
                                onClick={handleSearch}
                                className="bg-[#bfa06a] text-white px-4 py-2 rounded-lg hover:bg-[#a89053] transition-colors flex items-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                검색
                            </button>
                        </div>
                    </div>

                    {/* QnA 목록 */}
                    {loading ? (
                        <div className="bg-[#f5f1eb] border border-[#d6ccc2] rounded-lg p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bfa06a] mx-auto mb-4"></div>
                            <p className="text-[#5b4636]">문의 목록을 불러오는 중...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : filteredQnaList.length === 0 ? (
                        <div className="bg-[#f5f1eb] border border-[#d6ccc2] rounded-lg p-8 text-center">
                            <MessageCircle className="w-12 h-12 text-[#a89f91] mx-auto mb-4" />
                            <p className="text-[#5b4636] text-lg">관리자 문의가 없습니다.</p>
                            <p className="text-[#a89f91] text-sm mt-2">
                                {error ? '서버 문제로 데이터를 불러올 수 없습니다.' : '등록된 관리자 문의가 없습니다.'}
                            </p>
                            <button
                                onClick={() => router.push('/seller/qna/new')}
                                className="mt-4 bg-[#bfa06a] text-white px-4 py-2 rounded-lg hover:bg-[#a89053] transition-colors"
                            >
                                첫 번째 문의 작성하기
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-[#f5f1eb] rounded-lg shadow-sm border border-[#d6ccc2]">
                            <table className="min-w-full divide-y divide-[#d6ccc2]">
                                <thead className="bg-[#f5f1eb]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5b4636] uppercase tracking-wider">제목</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5b4636] uppercase tracking-wider">상태</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5b4636] uppercase tracking-wider">등록일</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5b4636] uppercase tracking-wider">답변일</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-[#5b4636] uppercase tracking-wider">액션</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#d6ccc2]">
                                    {filteredQnaList.map((qna) => (
                                        <tr key={qna.id} className="hover:bg-[#f5f1eb] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-[#5b4636] truncate max-w-xs">{qna.title}</div>
                                                <div className="text-sm text-[#a89f91] truncate max-w-xs">{qna.content}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(qna.isAnswered)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5b4636]">
                                                {new Date(qna.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5b4636]">
                                                {qna.answeredAt ? new Date(qna.answeredAt).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => router.push(`/seller/seller-qna/${qna.id}`)}
                                                        className="inline-flex items-center gap-1 bg-[#bfa06a] text-white px-3 py-1.5 rounded hover:bg-[#a89053] text-sm transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" /> 상세
                                                    </button>
                                                    {!qna.isAnswered && (
                                                        <button
                                                            onClick={() => router.push(`/seller/qna/${qna.id}/edit`)}
                                                            className="inline-flex items-center gap-1 bg-[#6b7280] text-white px-3 py-1.5 rounded hover:bg-[#5b4636] text-sm transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" /> 수정
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fetchQnaList(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                    className="px-3 py-2 border border-[#d6ccc2] rounded bg-white text-[#5b4636] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f5f1eb]"
                                >
                                    이전
                                </button>
                                <span className="px-3 py-2 text-[#5b4636]">
                                    {page + 1} / {totalPages}
                                </span>
                                <button
                                    onClick={() => fetchQnaList(Math.min(totalPages - 1, page + 1))}
                                    disabled={page === totalPages - 1}
                                    className="px-3 py-2 border border-[#d6ccc2] rounded bg-white text-[#5b4636] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f5f1eb]"
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