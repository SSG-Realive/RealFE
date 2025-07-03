'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchReviewDetail, updateReview } from '@/service/customer/reviewService';
import { uploadReviewImages, deleteReviewImage } from '@/service/customer/reviewImageService'; // 이미지 API 함수
import { ReviewResponseDTO } from '@/types/customer/review/review';
import Navbar from '@/components/customer/common/Navbar';
import StarRating from '@/components/customer/review/StarRating';
import Modal from '@/components/Modal';

export default function EditReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [review, setReview] = useState<ReviewResponseDTO | null>(null);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [tempRating, setTempRating] = useState<number | null>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 이미지 관리
  const [existingImages, setExistingImages] = useState<string[]>([]); // 서버에 저장된 기존 이미지 URL 리스트
  const [newImages, setNewImages] = useState<File[]>([]); // 새로 업로드할 이미지 파일들
  const [removedImages, setRemovedImages] = useState<string[]>([]); // 삭제 요청 이미지 URL 리스트

  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (!id) return;
    fetchReviewDetail(Number(id))
      .then((data) => {
        setReview(data);
        setContent(data.content);
        setRating(data.rating);
        setExistingImages(data.imageUrls ?? []);
      })
      .catch(() => setError('리뷰 정보를 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  // 새 이미지 파일 선택 시 처리
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        setNewImages((prev) => [...prev, ...Array.from(files)]);
    }
    e.target.value = '';
    };


  // 기존 이미지 삭제 처리
  const handleRemoveExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  // 새 이미지 미리보기 삭제 처리
  const handleRemoveNewImage = (file: File) => {
    setNewImages((prev) => prev.filter((f) => f !== file));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!id || !review) return;

  try {
    setLoading(true);

    const imageUrls = [...existingImages];

    await updateReview(Number(id), {
      content,
      rating,
      imageUrls,
    });

    // ✅ 모달 띄우기
    setShowSuccess(true);

    // ✅ 2초 뒤에 상세 페이지로 이동
    setTimeout(() => {
      router.push(`/customer/mypage/reviews/${id}`);
    }, 2000);

  } catch (err) {
    console.error(err);
    alert('리뷰 수정 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
};


  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!review) return <div>리뷰가 존재하지 않습니다.</div>;

  return (
    <div>
      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="리뷰 수정 완료"
        message="리뷰가 성공적으로 수정되었습니다."
        type="success"
        className="bg-black/30 backdrop-blur-sm"
        titleClassName="text-blue-900"
        buttonClassName="bg-blue-600"
      />
      <div className="max-w-2xl mx-auto px-6 py-10 bg-teal-50 rounded-md shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">리뷰 수정</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
        <div>
        <label className="block font-semibold mb-2 text-gray-700">
            별점: {(tempRating ?? rating).toFixed(1)}점
        </label>
        <StarRating rating={rating} setRating={setRating} setTempRating={setTempRating} />
        </div>


          <div>
            <label className="block font-semibold mb-2 text-gray-700">리뷰 내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border border-gray-300 rounded px-4 py-3 w-full min-h-[140px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="리뷰 내용을 입력하세요."
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-900  text-white rounded hover:bg-blue-600"
          >
            저장
          </button>
        </form>
      </div>
    </div>
  );
}
