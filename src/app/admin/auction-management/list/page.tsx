"use client";
import React, { useState } from "react";

interface Auction {
  id: number;
  name: string;
  product: string;
  seller: string;
  start: string;
  end: string;
  status: string;
  image: string;
  winner?: string;
  winningPrice?: string;
}

const dummyAuctions: Auction[] = [
  { id: 1, name: "노트북 경매", product: "노트북", seller: "홍길동", start: "2024-06-01", end: "2024-06-05", status: "진행중", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "스마트폰 경매", product: "스마트폰", seller: "김철수", start: "2024-06-02", end: "2024-06-06", status: "종료", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80", winner: "user3", winningPrice: "150,000원" },
  { id: 3, name: "자전거 경매", product: "자전거", seller: "이영희", start: "2024-06-03", end: "2024-06-07", status: "진행중", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" },
  { id: 4, name: "커피머신 경매", product: "커피머신", seller: "박민수", start: "2024-06-04", end: "2024-06-08", status: "종료", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", winner: "user7", winningPrice: "200,000원" },
  { id: 5, name: "의자 경매", product: "의자", seller: "최지우", start: "2024-06-05", end: "2024-06-09", status: "진행중", image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=400&q=80" },
  { id: 6, name: "모니터 경매", product: "모니터", seller: "정우성", start: "2024-06-06", end: "2024-06-10", status: "종료", image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", winner: "user2", winningPrice: "110,000원" },
  { id: 7, name: "책상 경매", product: "책상", seller: "이민호", start: "2024-06-07", end: "2024-06-11", status: "진행중", image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80" },
  { id: 8, name: "스피커 경매", product: "스피커", seller: "박지성", start: "2024-06-08", end: "2024-06-12", status: "종료", image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80", winner: "user5", winningPrice: "170,000원" },
  { id: 9, name: "프린터 경매", product: "프린터", seller: "김연아", start: "2024-06-09", end: "2024-06-13", status: "진행중", image: "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80" },
  { id: 10, name: "램프 경매", product: "램프", seller: "손흥민", start: "2024-06-10", end: "2024-06-14", status: "종료", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80", winner: "user9", winningPrice: "105,000원" },
];

export default function AuctionListPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Auction | null>(null);
  const filtered = dummyAuctions.filter(a => a.name.includes(search) || a.product.includes(search) || a.seller.includes(search));
  return (
    <div className="p-8">
      <h2 className="text-lg font-bold mb-4">경매 목록</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="경매명/상품명/판매자 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1">경매명</th>
            <th className="px-2 py-1">상품명</th>
            <th className="px-2 py-1">판매자</th>
            <th className="px-2 py-1">시작일</th>
            <th className="px-2 py-1">종료일</th>
            <th className="px-2 py-1">상태</th>
            <th className="px-2 py-1">낙찰자</th>
            <th className="px-2 py-1">낙찰가</th>
            <th className="px-2 py-1"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(a => (
            <tr key={a.id}>
              <td className="px-2 py-1">{a.name}</td>
              <td className="px-2 py-1">{a.product}</td>
              <td className="px-2 py-1">{a.seller}</td>
              <td className="px-2 py-1">{a.start}</td>
              <td className="px-2 py-1">{a.end}</td>
              <td className="px-2 py-1">{a.status}</td>
              <td className="px-2 py-1">{a.status === "종료" ? a.winner || "-" : "-"}</td>
              <td className="px-2 py-1">{a.status === "종료" ? a.winningPrice || "-" : "-"}</td>
              <td className="px-2 py-1">
                <button className="text-blue-600 underline" onClick={() => setSelected(a)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 min-w-[320px]">
            <h2 className="text-xl font-bold mb-4">경매 상세</h2>
            <img src={selected.image} alt="auction" className="mb-4 w-40 h-40 object-cover rounded" />
            <p><b>경매명:</b> {selected.name}</p>
            <p><b>상품명:</b> {selected.product}</p>
            <p><b>판매자:</b> {selected.seller}</p>
            <p><b>시작일:</b> {selected.start}</p>
            <p><b>종료일:</b> {selected.end}</p>
            <p><b>상태:</b> {selected.status}</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
} 