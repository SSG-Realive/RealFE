"use client";
import React, { useState } from "react";

interface SellerReview {
  id: number;
  product: string;
  author: string;
  rating: number;
  content: string;
  status: "정상" | "신고됨" | "삭제됨";
  createdAt: string;
}

const dummyReviews: SellerReview[] = [
  { id: 1, product: "노트북", author: "user1", rating: 5, content: "좋아요!", status: "정상", createdAt: "2024-06-01" },
  { id: 2, product: "키보드", author: "user2", rating: 2, content: "별로예요", status: "신고됨", createdAt: "2024-06-02" },
  { id: 3, product: "마우스", author: "user3", rating: 4, content: "만족", status: "정상", createdAt: "2024-06-03" },
];

export default function SellerReviewsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SellerReview | null>(null);

  const filtered = dummyReviews.filter(r => r.product.includes(search) || r.author.includes(search));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">판매자 리뷰 관리</h1>
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
            <th className="px-2 py-2">리뷰ID</th>
            <th className="px-2 py-2">상품</th>
            <th className="px-2 py-2">작성자</th>
            <th className="px-2 py-2">평점</th>
            <th className="px-2 py-2">내용</th>
            <th className="px-2 py-2">상태</th>
            <th className="px-2 py-2">등록일</th>
            <th className="px-2 py-2">액션</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.id}>
              <td className="px-2 py-2">{r.id}</td>
              <td className="px-2 py-2">{r.product}</td>
              <td className="px-2 py-2">{r.author}</td>
              <td className="px-2 py-2">{r.rating}점</td>
              <td className="px-2 py-2">{r.content}</td>
              <td className="px-2 py-2">{r.status}</td>
              <td className="px-2 py-2">{r.createdAt}</td>
              <td className="px-2 py-2">
                <button className="text-blue-600 underline mr-2" onClick={() => setSelected(r)}>상세</button>
                <button className="bg-yellow-400 text-white px-2 py-1 rounded mr-2">정상처리</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded">삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 min-w-[300px]">
            <h2 className="text-xl font-bold mb-4">리뷰 상세</h2>
            <p><b>상품:</b> {selected.product}</p>
            <p><b>작성자:</b> {selected.author}</p>
            <p><b>평점:</b> {selected.rating}점</p>
            <p><b>내용:</b> {selected.content}</p>
            <p><b>상태:</b> {selected.status}</p>
            <p><b>등록일:</b> {selected.createdAt}</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
} 