"use client";
import { useParams } from "next/navigation";

// 더미 데이터 (실제 프로젝트에서는 API 호출로 대체)
const dummyReviews = [
  { id: "1", product: "노트북", user: "user1", content: "좋아요!", date: "2024-06-01", status: "정상" },
  { id: "2", product: "키보드", user: "user2", content: "별로예요", date: "2024-06-02", status: "신고됨" },
  { id: "3", product: "마우스", user: "user3", content: "만족", date: "2024-06-03", status: "정상" },
  { id: "4", product: "모니터", user: "user4", content: "화질 좋아요", date: "2024-06-04", status: "정상" },
  { id: "5", product: "의자", user: "user5", content: "편해요", date: "2024-06-05", status: "정상" },
  { id: "6", product: "책상", user: "user6", content: "튼튼합니다", date: "2024-06-06", status: "신고됨" },
  { id: "7", product: "스피커", user: "user7", content: "음질 좋아요", date: "2024-06-07", status: "정상" },
  { id: "8", product: "프린터", user: "user8", content: "빠릅니다", date: "2024-06-08", status: "정상" },
  { id: "9", product: "마우스패드", user: "user9", content: "부드러워요", date: "2024-06-09", status: "정상" },
  { id: "10", product: "램프", user: "user10", content: "밝아요", date: "2024-06-10", status: "신고됨" },
];

export default function ReviewDetailPage() {
  const params = useParams();
  const { id } = params;

  // id로 해당 리뷰 찾기
  const review = dummyReviews.find(r => r.id === id);

  if (!review) {
    return <div style={{ padding: 32 }}>리뷰 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontWeight: 'bold', fontSize: 24 }}>리뷰 상세 페이지</h2>
      <p><b>상품명:</b> {review.product}</p>
      <p><b>작성자:</b> {review.user}</p>
      <p><b>내용:</b> {review.content}</p>
      <p><b>작성일:</b> {review.date}</p>
      <p><b>상태:</b> {review.status}</p>
    </div>
  );
} 