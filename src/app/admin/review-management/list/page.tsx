"use client";
import React, { useState } from "react";

interface Review {
  id: number;
  product: string;
  user: string;
  content: string;
  date: string;
  status: "정상" | "신고됨";
  productImage: string; // 실제 상품 이미지
}

const dummyReviews: Review[] = [
  { id: 1, product: "노트북", user: "user1", content: "좋아요!", date: "2024-06-01", status: "정상", productImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=facearea&w=256&q=80" },
  { id: 2, product: "키보드", user: "user2", content: "별로예요", date: "2024-06-02", status: "신고됨", productImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=facearea&w=256&q=80" },
  { id: 3, product: "마우스", user: "user3", content: "만족", date: "2024-06-03", status: "정상", productImage: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=256&q=80" },
  { id: 4, product: "모니터", user: "user4", content: "화질 좋아요", date: "2024-06-04", status: "정상", productImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=facearea&w=256&q=80" },
  { id: 5, product: "의자", user: "user5", content: "편해요", date: "2024-06-05", status: "정상", productImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&q=80" },
  { id: 6, product: "책상", user: "user6", content: "튼튼합니다", date: "2024-06-06", status: "신고됨", productImage: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=256&q=80" },
  { id: 7, product: "스피커", user: "user7", content: "음질 좋아요", date: "2024-06-07", status: "정상", productImage: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=facearea&w=256&q=80" },
  { id: 8, product: "프린터", user: "user8", content: "빠릅니다", date: "2024-06-08", status: "정상", productImage: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=256&q=80" },
  { id: 9, product: "마우스패드", user: "user9", content: "부드러워요", date: "2024-06-09", status: "정상", productImage: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=256&q=80" },
  { id: 10, product: "램프", user: "user10", content: "밝아요", date: "2024-06-10", status: "신고됨", productImage: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=facearea&w=256&q=80" },
];

export default function ReviewListPage() {
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const filtered = dummyReviews.filter(r => r.product.includes(search) || r.user.includes(search));

  return (
    <div className="p-8">
      <h2 className="text-lg font-bold mb-4">리뷰 목록</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="상품명/작성자 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>
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
          {filtered.map(r => (
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
            <div className="flex flex-col items-center gap-4 mb-4">
              <img src={selectedReview.productImage} alt={selectedReview.product} className="w-32 h-32 rounded-lg object-cover border" />
              <div>
                <p><b>상품명:</b> {selectedReview.product}</p>
                <p><b>작성자:</b> {selectedReview.user}</p>
                <p><b>내용:</b> {selectedReview.content}</p>
                <p><b>작성일:</b> {selectedReview.date}</p>
                <p><b>상태:</b> {selectedReview.status}</p>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setSelectedReview(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
} 