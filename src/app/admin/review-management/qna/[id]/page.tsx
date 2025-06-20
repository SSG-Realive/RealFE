"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAdminReviewQna, answerAdminReviewQna } from "@/service/admin/reviewService";
import { AdminReviewQnaDetail } from "@/types/admin/review";
import { useAdminAuthStore } from "@/store/admin/useAdminAuthStore";

export default function QnaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { accessToken } = useAdminAuthStore();
  const qnaId = Number(params.id);

  const [qna, setQna] = useState<AdminReviewQnaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchQnaDetail = async () => {
    if (!accessToken || isNaN(qnaId)) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminReviewQna(qnaId);
      setQna(data);
      if (data.answer) {
        setAnswer(data.answer);
      }
    } catch (err: any) {
      console.error("Q&A 상세 조회 실패:", err);
      setError(err.message || "Q&A 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchQnaDetail();
    } else {
      router.replace('/admin/login');
    }
  }, [accessToken, qnaId]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert("답변을 입력해주세요.");
      return;
    }
    
    // 백엔드 엔드포인트가 아직 구현되지 않았으므로 임시로 비활성화
    alert("답변 등록 기능은 백엔드 엔드포인트 구현 후 사용 가능합니다.");
    return;
    
    /*
    setIsSubmitting(true);
    try {
      console.log('Q&A 답변 등록 요청:', { qnaId, answer });
      await answerAdminReviewQna(qnaId, { answer });
      console.log('Q&A 답변 등록 성공');
      alert("답변이 성공적으로 등록되었습니다.");
      fetchQnaDetail(); // Refresh data
    } catch (err: any) {
      console.error('Q&A 답변 등록 실패:', err);
      console.error('에러 상세 정보:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers
      });
      alert(err.message || "답변 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
    */
  };

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!qna) return <div className="p-8">Q&A 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Q&A 상세</h1>
        <button 
          onClick={() => router.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          목록으로
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* 질문 정보 */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">질문 정보</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium">Q&A ID:</span>
              <span className="ml-2">{qna.id}</span>
            </div>
            <div>
              <span className="font-medium">제목:</span>
              <span className="ml-2">{qna.title}</span>
            </div>
            {qna.userName && (
              <div>
                <span className="font-medium">작성자:</span>
                <span className="ml-2">{qna.userName}</span>
              </div>
            )}
            <div>
              <span className="font-medium">작성일:</span>
              <span className="ml-2">{new Date(qna.createdAt).toLocaleString()}</span>
            </div>
             <div>
                <span className="font-medium">답변상태:</span>
                <span className={`ml-2 font-semibold ${qna.isAnswered ? 'text-green-600' : 'text-red-600'}`}>
                  {qna.isAnswered ? '답변완료' : '미답변'}
                </span>
              </div>
          </div>
        </div>
        
        {/* 질문 내용 */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">질문 내용</h2>
          <div className="p-4 bg-gray-50 rounded min-h-[100px]">
            <p className="whitespace-pre-wrap">{qna.content}</p>
          </div>
        </div>

        {/* 답변 입력 */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">답변 작성</h2>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="답변을 입력하세요..."
            rows={8}
            className="w-full border rounded p-3"
            disabled={isSubmitting}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmitAnswer}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isSubmitting || !answer.trim()}
            >
              {isSubmitting ? '등록 중...' : (qna.isAnswered ? '답변 수정' : '답변 등록')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 