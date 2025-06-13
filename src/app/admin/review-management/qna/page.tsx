"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Qna {
  id: number;
  user: string;
  title: string;
  created: string;
  answered: boolean;
}

const dummyQna: Qna[] = [
  { id: 1, user: "user4", title: "배송은 언제 오나요?", created: "2024-06-01", answered: true },
  { id: 2, user: "user5", title: "환불 문의", created: "2024-06-02", answered: false },
  { id: 3, user: "user6", title: "제품 사용법 문의", created: "2024-06-03", answered: true },
  { id: 4, user: "user7", title: "A/S 신청 방법?", created: "2024-06-04", answered: false },
  { id: 5, user: "user8", title: "재입고 일정", created: "2024-06-05", answered: true },
  { id: 6, user: "user9", title: "쿠폰 적용 문의", created: "2024-06-06", answered: false },
  { id: 7, user: "user10", title: "제품 호환성 문의", created: "2024-06-07", answered: true },
  { id: 8, user: "user11", title: "배송지 변경", created: "2024-06-08", answered: false },
  { id: 9, user: "user12", title: "결제 오류", created: "2024-06-09", answered: true },
  { id: 10, user: "user13", title: "포인트 적립 문의", created: "2024-06-10", answered: false },
];

function QnaManagementPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const filtered = dummyQna.filter(q => q.title.includes(search) || q.user.includes(search));

  return (
    <div className="p-8">
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="제목/작성자 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select className="border rounded px-3 py-2 ml-2">
          <option value="">전체</option>
          <option value="answered">답변완료</option>
          <option value="unanswered">미답변</option>
        </select>
      </div>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1">번호</th>
            <th className="px-2 py-1">작성자</th>
            <th className="px-2 py-1">제목</th>
            <th className="px-2 py-1">작성일</th>
            <th className="px-2 py-1">답변여부</th>
            <th className="px-2 py-1">상세</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(q => (
            <tr key={q.id}>
              <td style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'normal' }}>{q.id}</td>
              <td style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'normal' }}>{q.user}</td>
              <td style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'normal' }}>{q.title}</td>
              <td style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'normal' }}>{q.created}</td>
              <td style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'normal' }}>{q.answered ? "답변완료" : "미답변"}</td>
              <td style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'normal' }}>상세</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Object.assign(QnaManagementPage, { pageTitle: 'Q&A 관리' }); 