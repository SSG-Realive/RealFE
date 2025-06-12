"use client";
import React, { useState } from "react";

interface Bid {
  id: number;
  user: string;
  amount: string;
  date: string;
  userImage: string;
}

const dummyBids: Bid[] = [
  { id: 1, user: "user1", amount: "100,000원", date: "2024-06-01", userImage: "https://randomuser.me/api/portraits/men/11.jpg" },
  { id: 2, user: "user2", amount: "120,000원", date: "2024-06-01", userImage: "https://randomuser.me/api/portraits/women/12.jpg" },
  { id: 3, user: "user3", amount: "150,000원", date: "2024-06-02", userImage: "https://randomuser.me/api/portraits/men/13.jpg" },
  { id: 4, user: "user4", amount: "200,000원", date: "2024-06-03", userImage: "https://randomuser.me/api/portraits/women/14.jpg" },
  { id: 5, user: "user5", amount: "90,000원", date: "2024-06-04", userImage: "https://randomuser.me/api/portraits/men/15.jpg" },
  { id: 6, user: "user6", amount: "110,000원", date: "2024-06-05", userImage: "https://randomuser.me/api/portraits/women/16.jpg" },
  { id: 7, user: "user7", amount: "130,000원", date: "2024-06-06", userImage: "https://randomuser.me/api/portraits/men/17.jpg" },
  { id: 8, user: "user8", amount: "170,000원", date: "2024-06-07", userImage: "https://randomuser.me/api/portraits/women/18.jpg" },
  { id: 9, user: "user9", amount: "95,000원", date: "2024-06-08", userImage: "https://randomuser.me/api/portraits/men/19.jpg" },
  { id: 10, user: "user10", amount: "105,000원", date: "2024-06-09", userImage: "https://randomuser.me/api/portraits/women/20.jpg" },
];

// 낙찰자/낙찰가 계산 (가장 높은 금액)
const getWinner = () => {
  const sorted = [...dummyBids].sort((a, b) => parseInt(b.amount.replace(/[^0-9]/g, '')) - parseInt(a.amount.replace(/[^0-9]/g, '')));
  return { winner: sorted[0]?.user || '-', winningPrice: sorted[0]?.amount || '-' };
};
const { winner, winningPrice } = getWinner();

export default function BidListPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Bid | null>(null);
  const filtered = dummyBids.filter(bid => bid.user.includes(search));
  return (
    <div className="p-8">
      <h2 className="text-lg font-bold mb-4">입찰 내역 조회</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="입찰자 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1">User</th>
            <th className="px-2 py-1">Amount</th>
            <th className="px-2 py-1">Date</th>
            <th className="px-2 py-1">낙찰자</th>
            <th className="px-2 py-1">낙찰가</th>
            <th className="px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(bid => (
            <tr key={bid.id}>
              <td className="px-2 py-1">{bid.user}</td>
              <td className="px-2 py-1">{bid.amount}</td>
              <td className="px-2 py-1">{bid.date}</td>
              <td className="px-2 py-1">{winner}</td>
              <td className="px-2 py-1">{winningPrice}</td>
              <td className="px-2 py-1">
                <button className="text-blue-600 underline" onClick={() => setSelected(bid)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 min-w-[320px]">
            <h2 className="text-xl font-bold mb-4">입찰 상세</h2>
            <div className="flex items-center gap-4 mb-4">
              <img src={selected.userImage} alt={selected.user} className="w-16 h-16 rounded-full border" />
              <div>
                <p><b>입찰자:</b> {selected.user}</p>
                <p><b>금액:</b> {selected.amount}</p>
                <p><b>일자:</b> {selected.date}</p>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
} 