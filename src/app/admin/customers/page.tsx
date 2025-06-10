import React, { useState } from 'react';
import DetailModal from '../../../components/DetailModal';

const dummyCustomers = [
  { id: 1, name: '홍길동', email: 'hong@test.com', joined: '2024-06-10', status: '활성' },
  { id: 2, name: '이몽룡', email: 'lee@test.com', joined: '2024-06-09', status: '비활성' },
];

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [sort, setSort] = useState<'name' | 'joined'>('name');
  const [detailId, setDetailId] = useState<number | null>(null);
  const [logId, setLogId] = useState<number | null>(null);

  const filtered = dummyCustomers
    .filter(c => c.name.includes(search) || c.email.includes(search))
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : a.joined.localeCompare(b.joined));

  const toggleSelect = (id: number) => {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  };

  return (
    <div>
      <h2>고객 관리</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="고객명/ID 검색" />
        <select value={sort} onChange={e => setSort(e.target.value as any)}>
          <option value="name">이름순</option>
          <option value="joined">가입일순</option>
        </select>
        <button>검색</button>
        {selected.length > 0 && (
          <button style={{ background: 'red', color: 'white' }}>일괄 삭제({selected.length})</button>
        )}
      </div>
      <table style={{ width: '100%', background: '#eee' }}>
        <thead>
          <tr>
            <th><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={e => setSelected(e.target.checked ? filtered.map(c => c.id) : [])} /></th>
            <th>고객명</th>
            <th>이메일</th>
            <th>가입일</th>
            <th>상태</th>
            <th>상세</th>
            <th>이력</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(c => (
            <tr key={c.id}>
              <td><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} /></td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.joined}</td>
              <td>{c.status}</td>
              <td><button onClick={() => setDetailId(c.id)}>보기</button></td>
              <td><button onClick={() => setLogId(c.id)}>이력</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <DetailModal open={!!detailId} onClose={() => setDetailId(null)} title="고객 상세">
        <div>고객 ID: {detailId}</div>
        <div>상세 정보 예시...</div>
      </DetailModal>
      <DetailModal open={!!logId} onClose={() => setLogId(null)} title="고객 이력/로그">
        <div>이력 정보 예시 (수정/삭제/상태변경 등)</div>
      </DetailModal>
    </div>
  );
} 