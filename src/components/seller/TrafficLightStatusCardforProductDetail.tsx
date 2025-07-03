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
        // 컨테이너 패딩, 최소 높이/너비 대폭 축소
        // flex-row로 변경하여 내용을 가로로 배치 시도
        <div className={`bg-[#f3f4f6] rounded-xl shadow-md border border-[#d1d5db] flex items-center justify-between py-2 px-3 min-h-[50px] min-w-[200px] max-w-[250px] transition-all hover:border-[#a89f91] hover:shadow-lg ${className}`}>
            {/* SVG 아이콘 및 텍스트 영역 */}
            <div className="flex items-center gap-2"> {/* 아이콘과 텍스트가 가로로 나란히 */}
                <span className="animate-pulse" style={{ display: 'inline-block' }}>
                    <svg width="24" height="24" viewBox="0 0 56 56"> {/* SVG 너비/높이 더 축소 */}
                        <circle
                            cx="28"
                            cy="28"
                            r="10" // 원의 반지름 더 축소
                            fill={getCircleColor(rating)}
                            stroke="#d6ccc2"
                            strokeWidth="4"
                            style={{ filter: isNoReview ? 'grayscale(1)' : 'drop-shadow(0 0 2px #fff)' }} // 그림자 효과 더 축소
                        />
                    </svg>
                </span>
                <div className="flex flex-col text-left"> {/* 텍스트들은 세로로 정렬 */}
                    <div className="text-xs font-bold text-[#374151] leading-none">{title}</div> {/* 폰트 크기 대폭 축소 */}
                    <div className="text-sm font-extrabold text-[#374151] leading-none">{isNoReview ? '평가 없음' : getTrafficLightText(rating)}</div> {/* 폰트 크기 대폭 축소 */}
                </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2"> {/* 리뷰 건수를 오른쪽에 배치, 줄 바꿈 방지 */}
                <div className="text-xs text-[#a89f91] whitespace-nowrap">리뷰 {count ?? 0}건</div> {/* 폰트 크기 축소, 줄 바꿈 방지 */}
            </div>
        </div>
    );
}