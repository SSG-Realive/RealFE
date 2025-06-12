"use client";
import React, { useState } from "react";

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
];

export default function QnaManagementPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Qna | null>(null);

  const filtered = dummyQna.filter(q => q.title.includes(search) || q.user.includes(search));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Q&A 관리</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="제목/작성자 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-2">번호</th>
            <th className="px-2 py-2">작성자</th>
            <th className="px-2 py-2">제목</th>
            <th className="px-2 py-2">작성일</th>
            <th className="px-2 py-2">답변여부</th>
            <th className="px-2 py-2">상세</th>
            <th className="px-2 py-2">액션</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(q => (
            <tr key={q.id}>
              <td className="px-2 py-2">{q.id}</td>
              <td className="px-2 py-2">{q.user}</td>
              <td className="px-2 py-2">{q.title}</td>
              <td className="px-2 py-2">{q.created}</td>
              <td className="px-2 py-2">{q.answered ? "답변완료" : "미답변"}</td>
              <td className="px-2 py-2">
                <button className="text-blue-600 underline" onClick={() => setSelected(q)}>상세</button>
              </td>
              <td className="px-2 py-2">
                <button className="bg-green-500 text-white px-2 py-1 rounded mr-2">답변</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded">삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 min-w-[300px]">
            <h2 className="text-xl font-bold mb-4">Q&A 상세</h2>
            <p><b>제목:</b> {selected.title}</p>
            <p><b>작성자:</b> {selected.user}</p>
            <p><b>작성일:</b> {selected.created}</p>
            <p><b>답변여부:</b> {selected.answered ? "답변완료" : "미답변"}</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
} 