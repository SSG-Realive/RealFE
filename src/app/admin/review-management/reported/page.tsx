"use client";
import React, { useState } from "react";

const dummyReported = [
  { product: "키보드", user: "user2", reason: "욕설", status: "신고됨", userImage: "https://randomuser.me/api/portraits/women/52.jpg" },
  { product: "의자", user: "user5", reason: "광고성", status: "신고됨", userImage: "https://randomuser.me/api/portraits/men/55.jpg" },
  { product: "책상", user: "user6", reason: "도배", status: "신고됨", userImage: "https://randomuser.me/api/portraits/women/56.jpg" },
  { product: "마우스", user: "user3", reason: "부적절한 내용", status: "신고됨", userImage: "https://randomuser.me/api/portraits/men/53.jpg" },
  { product: "모니터", user: "user4", reason: "욕설", status: "신고됨", userImage: "https://randomuser.me/api/portraits/women/54.jpg" },
  { product: "노트북", user: "user1", reason: "도배", status: "신고됨", userImage: "https://randomuser.me/api/portraits/men/51.jpg" },
  { product: "스피커", user: "user7", reason: "욕설", status: "신고됨", userImage: "https://randomuser.me/api/portraits/men/57.jpg" },
  { product: "프린터", user: "user8", reason: "광고성", status: "신고됨", userImage: "https://randomuser.me/api/portraits/women/58.jpg" },
  { product: "마우스패드", user: "user9", reason: "도배", status: "신고됨", userImage: "https://randomuser.me/api/portraits/men/59.jpg" },
  { product: "램프", user: "user10", reason: "욕설", status: "신고됨", userImage: "https://randomuser.me/api/portraits/women/60.jpg" },
  { product: "노트북 파우치", user: "user11", reason: "욕설", status: "신고처리됨", userImage: "https://randomuser.me/api/portraits/men/61.jpg" },
  { product: "USB 허브", user: "user12", reason: "광고성", status: "신고처리됨", userImage: "https://randomuser.me/api/portraits/women/62.jpg" },
  { product: "스탠드", user: "user13", reason: "도배", status: "신고처리됨", userImage: "https://randomuser.me/api/portraits/men/63.jpg" },
];

type Reported = typeof dummyReported[0];

export default function ReviewReportedPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Reported | null>(null);
  const filtered = dummyReported.filter(r =>
    (r.product.includes(search) || r.user.includes(search) || r.reason.includes(search)) &&
    (!status || r.status === status)
  );
  return (
    <div className="p-8">
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="상품명/작성자/사유 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">전체</option>
          <option value="신고됨">신고됨</option>
          <option value="신고처리됨">신고처리됨</option>
        </select>
      </div>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1">상품명</th>
            <th className="px-2 py-1">작성자</th>
            <th className="px-2 py-1">사유</th>
            <th className="px-2 py-1">상태</th>
            <th className="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, idx) => (
            <tr key={idx}>
              <td style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'normal' }}>{r.product}</td>
              <td style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'normal' }}>{r.user}</td>
              <td style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'normal' }}>{r.reason}</td>
              <td style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'normal' }}>{r.status}</td>
              <td style={{ textDecoration: 'none', fontWeight: 'normal', cursor: 'pointer', color: '#0070f3' }} onClick={() => setSelected(r)}>View</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 min-w-[320px]">
            <h2 className="text-xl font-bold mb-4">신고 상세</h2>
            <div className="flex items-center gap-4 mb-4">
              <img src={selected.userImage} alt={selected.user} className="w-16 h-16 rounded-full border" />
              <div>
                <p><b>상품명:</b> {selected.product}</p>
                <p><b>작성자:</b> {selected.user}</p>
                <p><b>사유:</b> {selected.reason}</p>
                <p><b>상태:</b> {selected.status}</p>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
} 