'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQnaDetail, deleteQna } from '@/service/seller/sellerQnaService';
import { SellerQnaDetailResponse } from '@/types/seller/sellerqna/sellerQnaResponse';
import SellerLayout from '@/components/layouts/SellerLayout';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import SellerHeader from '@/components/seller/SellerHeader';
import { MessageCircle, CheckCircle, Clock, Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function SellerQnaDetailPage() {
    const checking = useSellerAuthGuard();
    const params = useParams();
    const router = useRouter();

    const id = Number(params.id);

    const [qna, setQna] = useState<SellerQnaDetailResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getQnaDetail(id);
                
                // isActive가 false인 경우 접근 차단
                if (!response.isActive) {
                    alert('삭제된 문의입니다.');
                    router.push('/seller/seller-qna');
                    return;
                }
                
                setQna(response);
                setError(null);
            } catch (err) {
                console.error('QnA 상세 조회 실패:', err);
                setError('QnA 데이터를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (!checking && !isNaN(id)) {
            fetchData();
        }
    }, [checking, id, router]);

    const handleDelete = async () => {
        const confirmed = window.confirm('정말로 이 QnA를 삭제하시겠습니까? 삭제된 QnA는 목록에서 숨겨집니다.');
        if (!confirmed) return;

        try {
            await deleteQna(id);
            alert('QnA가 삭제되었습니다.');
            router.push('/seller/seller-qna');
        } catch (err) {
            console.error('QnA 삭제 실패:', err);
            alert('QnA 삭제에 실패했습니다.');
        }
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
                <div className="max-w-4xl mx-auto p-4 sm:p-6">
                    <button
                        onClick={() => router.push('/seller/seller-qna')}
                        className="mb-4 text-[#a89f91] hover:text-[#5b4636] hover:underline flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>목록으로 돌아가기</span>
                    </button>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bfa06a] mx-auto mb-4"></div>
                            <p className="text-[#5b4636]">로딩 중...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : qna ? (
                        <div className="space-y-6">
                            {/* 상태 정보 */}
                            <div className="bg-[#f5f1eb] rounded-lg shadow-sm border border-[#d6ccc2] p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5 text-[#a89f91]" />
                                        <span className="text-[#5b4636] font-semibold">관리자 문의 상세</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {qna.isAnswered ? (
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4" />
                                                답변 완료
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                답변 대기
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-[#5b4636]">등록일:</span>
                                        <span className="ml-2 text-[#a89f91]">{new Date(qna.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#5b4636]">수정일:</span>
                                        <span className="ml-2 text-[#a89f91]">{new Date(qna.updatedAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 문의 내용 */}
                            <div className="bg-white rounded-lg shadow-sm border border-[#d6ccc2] p-4 sm:p-6">
                                <h1 className="text-xl sm:text-2xl font-bold mb-4 text-[#5b4636] break-words">{qna.title}</h1>
                                
                                <div className="bg-[#f5f1eb] rounded-lg p-4 border border-[#d6ccc2]">
                                    <h3 className="text-sm font-semibold text-[#5b4636] mb-2">문의 내용</h3>
                                    <p className="text-[#5b4636] whitespace-pre-wrap">{qna.content || '문의 내용이 없습니다.'}</p>
                                </div>
                            </div>

                            {/* 답변 영역 */}
                            {qna.answer ? (
                                <div className="bg-white rounded-lg shadow-sm border border-[#d6ccc2] p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-[#5b4636] mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        관리자 답변
                                    </h3>
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <p className="text-[#5b4636] whitespace-pre-wrap">{qna.answer}</p>
                                        <div className="mt-3 text-xs text-[#a89f91]">
                                            답변일: {qna.answeredAt ? new Date(qna.answeredAt).toLocaleString() : '-'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4 sm:p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-5 h-5 text-yellow-600" />
                                        <h3 className="text-lg font-semibold text-yellow-800">답변 대기 중</h3>
                                    </div>
                                    <p className="text-yellow-700">관리자의 답변을 기다리고 있습니다.</p>
                                </div>
                            )}

                            {/* 액션 버튼 */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {!qna.isAnswered && (
                                    <>
                                        <button
                                            onClick={() => router.push(`/seller/qna/${qna.id}/edit`)}
                                            className="flex items-center justify-center gap-2 bg-[#bfa06a] text-white px-6 py-3 rounded-lg hover:bg-[#a89053] transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            수정하기
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            삭제하기
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => router.push('/seller/seller-qna')}
                                    className="flex items-center justify-center gap-2 bg-[#6b7280] text-white px-6 py-3 rounded-lg hover:bg-[#5b4636] transition-colors"
                                >
                                    목록으로
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-[#a89f91]">문의를 찾을 수 없습니다.</p>
                        </div>
                    )}
                </div>
            </SellerLayout>
        </>
    );
} 