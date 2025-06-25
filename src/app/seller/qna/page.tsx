'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getQnaList } from '@/service/seller/sellerQnaService';
import { SellerQnaResponse } from '@/types/seller/sellerqna/sellerQnaResponse';
import SellerLayout from '@/components/layouts/SellerLayout';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import SellerHeader from '@/components/seller/SellerHeader';
import { MessageCircle, CheckCircle, Clock, Plus, Eye, Search, Filter } from 'lucide-react';

export default function SellerQnaPage() {
    const checking = useSellerAuthGuard(); // ✅ 가드 적용 (일관성 유지)

    const router = useRouter();

    const [qnaList, setQnaList] = useState<SellerQnaResponse[]>([]);
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
                const res = await getQnaList({ page, size: 10 });
                setQnaList(res.content || []);
                setTotalPages(res.totalPages || 1);
                setError(null);
            } catch (err) {
                console.error('QnA 목록 조회 실패:', err);
                setError('QnA 데이터를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [page, checking]);

    // 통계 계산
    const totalQna = qnaList.length;
    const answeredQna = qnaList.filter(qna => qna.isAnswered).length;
    const unansweredQna = qnaList.filter(qna => !qna.isAnswered).length;
    const activeQna = qnaList.filter(qna => qna.isActive).length;

    // 필터링된 QnA 목록
    const filteredQnaList = qnaList.filter(qna => {
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
            <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                답변 완료
            </span>
        ) : (
            <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                미답변
            </span>
        );
    };

    if (checking || loading) {
        return (
            <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">문의 정보를 불러오는 중...</p>
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
                <div className="flex-1 w-full h-full px-4 py-8 bg-gray-100">
                    <h1 className="text-xl md:text-2xl font-bold mb-6">고객 문의 관리</h1>

                    {/* 상단 통계 카드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                        <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border flex items-center justify-between">
                            <div>
                                <h2 className="text-gray-600 text-sm font-semibold mb-2">총 문의 수</h2>
                                <p className="text-xl md:text-2xl font-bold text-gray-800">{totalQna}건</p>
                            </div>
                            <MessageCircle className="w-8 h-8 text-blue-500" />
                        </section>
                        <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border flex items-center justify-between">
                            <div>
                                <h2 className="text-gray-600 text-sm font-semibold mb-2">답변 완료</h2>
                                <p className="text-xl md:text-2xl font-bold text-green-600">{answeredQna}건</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </section>
                        <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border flex items-center justify-between">
                            <div>
                                <h2 className="text-gray-600 text-sm font-semibold mb-2">미답변</h2>
                                <p className="text-xl md:text-2xl font-bold text-red-600">{unansweredQna}건</p>
                            </div>
                            <Clock className="w-8 h-8 text-red-500" />
                        </section>
                        <section className="bg-white p-4 md:p-6 rounded-lg shadow-sm border flex items-center justify-between">
                            <div>
                                <h2 className="text-gray-600 text-sm font-semibold mb-2">활성 문의</h2>
                                <p className="text-xl md:text-2xl font-bold text-purple-600">{activeQna}건</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => router.push('/seller/qna/new')}
                                    className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 flex items-center gap-1 text-sm"
                                >
                                    <Plus className="w-3 h-3" />
                                    문의 등록
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* 검색/필터 영역 */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 items-center">
                        <input
                            type="text"
                            placeholder="제목, 내용으로 검색"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">전체 상태</option>
                            <option value="answered">답변 완료</option>
                            <option value="unanswered">미답변</option>
                        </select>
                        <button 
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Search className="w-4 h-4" />
                            검색
                        </button>
                    </div>

                    {/* QnA 리스트 */}
                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : filteredQnaList.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">문의가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">답변일</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredQnaList.map((qna) => (
                                        <tr key={qna.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800 max-w-xs truncate">
                                                {qna.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(qna.isAnswered)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(qna.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {qna.answeredAt ? new Date(qna.answeredAt).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => router.push(`/seller/qna/${qna.id}`)}
                                                    className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
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

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex gap-2 justify-center items-center">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                                disabled={page === 0}
                                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                이전
                            </button>
                            <span className="text-sm px-4 py-2 bg-white border border-gray-300 rounded-md">
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                                disabled={page >= totalPages - 1}
                                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                다음
                            </button>
                        </div>
                    )}
                </div>
            </SellerLayout>
        </>
    );
}