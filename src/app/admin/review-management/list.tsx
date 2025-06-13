"use client";
import React, { useState } from "react";

interface Review {
  id: number;
  product: string;
  user: string;
  content: string;
  date: string;
  status: "정상" | "신고됨";
}

const dummyReviews: Review[] = [
  { id: 1, product: "노트북", user: "user1", content: "좋아요!", date: "2024-06-01", status: "정상" },
  { id: 2, product: "키보드", user: "user2", content: "별로예요", date: "2024-06-02", status: "신고됨" },
  { id: 3, product: "마우스", user: "user3", content: "만족", date: "2024-06-03", status: "정상" },
  { id: 4, product: "모니터", user: "user4", content: "화질 좋아요", date: "2024-06-04", status: "정상" },
  { id: 5, product: "의자", user: "user5", content: "편해요", date: "2024-06-05", status: "정상" },
  { id: 6, product: "책상", user: "user6", content: "튼튼합니다", date: "2024-06-06", status: "신고됨" },
  { id: 7, product: "스피커", user: "user7", content: "음질 좋아요", date: "2024-06-07", status: "정상" },
  { id: 8, product: "프린터", user: "user8", content: "빠릅니다", date: "2024-06-08", status: "정상" },
  { id: 9, product: "마우스패드", user: "user9", content: "부드러워요", date: "2024-06-09", status: "정상" },
  { id: 10, product: "램프", user: "user10", content: "밝아요", date: "2024-06-10", status: "신고됨" },
];

export default function ReviewListPage() {
  const [reviewSearch, setReviewSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [status, setStatus] = useState("");
  const filteredReviews = dummyReviews.filter(
    r => (r.product.includes(reviewSearch) || r.user.includes(reviewSearch)) &&
         (!status || r.status === status)
  );

  return (
    <div className="p-8">
      <form className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="상품명/작성자 검색"
          value={reviewSearch}
          onChange={e => setReviewSearch(e.target.value)}
          className="border rounded px-3 py-2 w-64"
        />
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">전체</option>
          <option value="정상">정상</option>
          <option value="신고됨">신고됨</option>
        </select>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="button">검색</button>
      </form>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1">상품명</th>
            <th className="px-2 py-1">작성자</th>
            <th className="px-2 py-1">내용</th>
            <th className="px-2 py-1">작성일</th>
            <th className="px-2 py-1">상태</th>
            <th className="px-2 py-1">상세</th>
          </tr>
        </thead>
        <tbody>
          {filteredReviews.map(r => (
            <tr key={r.id}>
              <td className="px-2 py-1">{r.product}</td>
              <td className="px-2 py-1">{r.user}</td>
              <td className="px-2 py-1">{r.content}</td>
              <td className="px-2 py-1">{r.date}</td>
              <td className="px-2 py-1">{r.status}</td>
              <td className="px-2 py-1">
                <button className="text-blue-600 underline" onClick={() => setSelectedReview(r)}>상세</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 min-w-[300px]">
            <h2 className="text-xl font-bold mb-4">리뷰 상세</h2>
            <p><b>상품명:</b> {selectedReview.product}</p>
            <p><b>작성자:</b> {selectedReview.user}</p>
            <p><b>내용:</b> {selectedReview.content}</p>
            <p><b>작성일:</b> {selectedReview.date}</p>
            <p><b>상태:</b> {selectedReview.status}</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setSelectedReview(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
} 