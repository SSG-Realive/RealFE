// components/customer/qna/QnaList.tsx (기존 파일 수정)

import { useState } from 'react';
// SellerQnaResponse를 임포트하여 사용
import { SellerQnaResponse } from '@/types/seller/sellerqna/sellerQnaResponse';

interface QnaListProps {
    qnas: SellerQnaResponse[]; // SellerQnaResponse 배열을 받도록 타입 변경
    initialDisplayCount?: number; // 초기 표시 개수
}

export default function QnaList({ qnas, initialDisplayCount = 3 }: QnaListProps) {
    const [showAll, setShowAll] = useState(false);

    const displayedQnas = showAll ? qnas : qnas.slice(0, initialDisplayCount);

    return (
        <div className="space-y-4">
            {displayedQnas.length > 0 ? (
                displayedQnas.map((qna) => (
                    <div key={qna.id} className="border p-4 rounded-md bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-light text-sm text-gray-800">{qna.title}</span> {/* 제목 필드 사용 */}
                            <span className="text-xs text-gray-500">{new Date(qna.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{qna.content}</p> {/* 내용 필드 사용 */}
                        {qna.isAnswered ? ( // isAnswered 필드 사용
                            <div className="mt-2 p-3 bg-white border border-gray-200 rounded-md">
                                <span className="font-light text-sm text-blue-600">답변: </span>
                                <p className="text-sm text-gray-800 line-clamp-2">{qna.answer}</p> {/* 답변 필드 사용 */}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">아직 답변이 등록되지 않았습니다.</p>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-600">등록된 QnA가 없습니다.</p>
            )}

            {qnas.length > initialDisplayCount && (
                <div className="text-center mt-4">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="px-4 py-2 border rounded-md text-sm font-light hover:bg-gray-100"
                    >
                        {showAll ? '간략히 보기' : '더 보기'}
                    </button>
                </div>
            )}
        </div>
    );
}