// src/components/seller/TrafficLightStatusCardforProductDetail.tsx (혹은 해당 파일 경로)

'use client';

import { getTrafficLightText } from '@/types/admin/review';

interface TrafficLightStatusCardProps {
    title: string;
    rating: number;
    count?: number;
    className?: string;
}

function getCircleColor(rating: number) {
    if (rating <= 2 && rating > 0) return '#ef4444'; // 빨강
    if (rating === 3) return '#facc15'; // 노랑
    if (rating >= 4) return '#22c55e'; // 초록
    return '#d1d5db'; // 회색
}

export default function TrafficLightStatusCardforProductDetail({
                                                                   title,
                                                                   rating,
                                                                   count,
                                                                   className = ""
                                                               }: TrafficLightStatusCardProps) {
    const isNoReview = !count || rating === 0;
    return (
        // 세로가 긴 직사각형 모양을 위해 min-h를 키우고, min-w는 유지
        // 내부 flex-col로 유지하여 텍스트가 세로로 나열되도록 하고, 중앙 정렬
        <div className={`bg-[#f3f4f6] rounded-2xl shadow-xl border-2 border-[#d1d5db] flex flex-col items-center justify-center py-5 px-4 min-h-[120px] min-w-[150px] transition-all hover:border-[#a89f91] hover:shadow-2xl ${className}`}>
            <div className="flex flex-col items-center justify-center w-full">
                <span className="mb-1 animate-pulse" style={{ display: 'inline-block' }}>
                    <svg width="40" height="40" viewBox="0 0 56 56">
                        <circle
                            cx="28"
                            cy="28"
                            r="16" // 원의 반지름은 적당히 유지
                            fill={getCircleColor(rating)}
                            stroke="#d6ccc2"
                            strokeWidth="4"
                            style={{ filter: isNoReview ? 'grayscale(1)' : 'drop-shadow(0 0 4px #fff)' }}
                        />
                    </svg>
                </span>
                <div className="text-base font-bold text-[#374151] mb-0.5 whitespace-nowrap">{title}</div> {/* 폰트 크기 및 줄 바꿈 방지 */}
                <div className="text-lg font-extrabold text-[#374151] mb-0.5 whitespace-nowrap">{isNoReview ? '평가 없음' : getTrafficLightText(rating)}</div> {/* 폰트 크기 및 줄 바꿈 방지 */}
                <div className="text-sm text-[#a89f91] mt-0.5 whitespace-nowrap">리뷰 {count ?? 0}건</div> {/* 폰트 크기 및 줄 바꿈 방지 */}
            </div>
        </div>
    );
}