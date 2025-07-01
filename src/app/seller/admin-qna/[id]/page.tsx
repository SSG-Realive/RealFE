'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminInquiryDetail, AdminInquiryResponse } from '@/service/seller/adminInquiryService';
import SellerLayout from '@/components/layouts/SellerLayout';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import SellerHeader from '@/components/seller/SellerHeader';
import { MessageCircle, CheckCircle, Clock, ArrowLeft, User, Calendar } from 'lucide-react';

export default function AdminQnaDetailPage() {
    const checking = useSellerAuthGuard();
    const params = useParams();
    const router = useRouter();

    const id = Number(params.id);

    const [inquiry, setInquiry] = useState<AdminInquiryResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getAdminInquiryDetail(id);
                setInquiry(response);
                setError(null);
            } catch (err) {
                console.error('관리자 문의 상세 조회 실패:', err);
                setError('문의 데이터를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (!checking && !isNaN(id)) {
            fetchData();
        }
    }, [checking, id]);

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
                        onClick={() => router.push('/seller/admin-qna')}
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
                    ) : inquiry ? (
                        <div className="space-y-6">
                            {/* 상태 정보 */}
                            <div className="bg-[#f5f1eb] rounded-lg shadow-sm border border-[#d6ccc2] p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5 text-[#a89f91]" />
                                        <span className="text-[#5b4636] font-semibold">관리자 문의 상세</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {inquiry.isAnswered ? (
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
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-[#a89f91]" />
                                        <span className="font-medium text-[#5b4636]">작성자:</span>
                                        <span className="text-[#a89f91]">{inquiry.sellerName || '판매자'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#a89f91]" />
                                        <span className="font-medium text-[#5b4636]">등록일:</span>
                                        <span className="text-[#a89f91]">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#a89f91]" />
                                        <span className="font-medium text-[#5b4636]">수정일:</span>
                                        <span className="text-[#a89f91]">{new Date(inquiry.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 문의 내용 */}
                            <div className="bg-white rounded-lg shadow-sm border border-[#d6ccc2] p-4 sm:p-6">
                                <h1 className="text-xl sm:text-2xl font-bold mb-4 text-[#5b4636] break-words">{inquiry.title}</h1>
                                
                                <div className="bg-[#f5f1eb] rounded-lg p-4 border border-[#d6ccc2]">
                                    <h3 className="text-sm font-semibold text-[#5b4636] mb-2">문의 내용</h3>
                                    <p className="text-[#5b4636] whitespace-pre-wrap">{inquiry.content || '문의 내용이 없습니다.'}</p>
                                </div>

                                {inquiry.category && (
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="text-sm font-medium text-[#5b4636]">카테고리:</span>
                                        <span className="px-2 py-1 bg-[#f5f1eb] border border-[#d6ccc2] rounded text-sm text-[#5b4636]">
                                            {inquiry.category}
                                        </span>
                                    </div>
                                )}

                                {inquiry.priority && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm font-medium text-[#5b4636]">우선순위:</span>
                                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                                            inquiry.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                            inquiry.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {inquiry.priority === 'HIGH' ? '높음' : 
                                             inquiry.priority === 'MEDIUM' ? '보통' : '낮음'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 답변 영역 */}
                            {inquiry.answer ? (
                                <div className="bg-white rounded-lg shadow-sm border border-[#d6ccc2] p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-[#5b4636] mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        관리자 답변
                                    </h3>
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <p className="text-[#5b4636] whitespace-pre-wrap">{inquiry.answer}</p>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-[#a89f91]">
                                            <span>답변일: {inquiry.answeredAt ? new Date(inquiry.answeredAt).toLocaleString() : '-'}</span>
                                            {inquiry.answeredBy && <span>답변자 ID: {inquiry.answeredBy}</span>}
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
                                    {inquiry.status && (
                                        <div className="mt-2">
                                            <span className="text-sm font-medium text-yellow-800">상태: </span>
                                            <span className="text-sm text-yellow-700">
                                                {inquiry.status === 'PENDING' ? '대기중' :
                                                 inquiry.status === 'IN_PROGRESS' ? '처리중' :
                                                 inquiry.status === 'ANSWERED' ? '답변완료' :
                                                 inquiry.status === 'CLOSED' ? '종료' : inquiry.status}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 액션 버튼 */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => router.push('/seller/admin-qna')}
                                    className="bg-[#6b7280] text-white px-6 py-3 rounded-lg hover:bg-[#5b4636] transition-colors"
                                >
                                    목록으로 돌아가기
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