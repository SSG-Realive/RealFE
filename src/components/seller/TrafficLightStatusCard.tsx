'use client';

import { getTrafficLightText } from '@/types/admin/review';

interface TrafficLightStatusCardProps {
  title: string;
  rating: number;
  count?: number;
  className?: string;
}

function getCircleColor(rating: number) {
  if (rating >= 0.1 && rating <= 2.0) return '#ef4444'; // 빨강 (0.1~2.0)
  if (rating >= 2.1 && rating <= 3.5) return '#facc15'; // 노랑 (2.1~3.5)
  if (rating >= 3.6 && rating <= 5.0) return '#22c55e'; // 초록 (3.6~5.0)
  return '#d1d5db'; // 회색 (평가없음)
}

export default function TrafficLightStatusCard({ 
  title, 
  rating, 
  count,
  className = "" 
}: TrafficLightStatusCardProps) {
  const isNoReview = !count || rating === 0;
  return (
    <div className={`bg-[#f3f4f6] rounded-2xl shadow-xl border-2 border-[#d1d5db] flex flex-col items-center justify-center py-8 px-6 min-h-[180px] min-w-[220px] transition-all hover:border-[#a89f91] hover:shadow-2xl ${className}`}>
      <div className="flex flex-col items-center justify-center w-full">
        <span className="mb-2 animate-pulse" style={{ display: 'inline-block' }}>
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r="24"
              fill={getCircleColor(rating)}
              stroke="#d6ccc2"
              strokeWidth="4"
              style={{ filter: isNoReview ? 'grayscale(1)' : 'drop-shadow(0 0 8px #fff)' }}
            />
          </svg>
        </span>
        <div className="text-lg font-bold text-[#374151] mb-1">{title}</div>
        <div className="text-xl font-extrabold text-[#374151] mb-1">{isNoReview ? '평가 없음' : getTrafficLightText(rating)}</div>
        <div className="text-sm text-[#a89f91] mt-1">리뷰 {count ?? 0}건</div>
      </div>
    </div>
  );
} 