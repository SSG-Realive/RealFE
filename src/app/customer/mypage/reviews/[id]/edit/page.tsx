'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchReviewDetail, updateReview } from '@/service/customer/reviewService';

import { ReviewResponseDTO } from '@/types/customer/review/review';
import StarRating from '@/components/customer/review/StarRating';
import Modal from '@/components/Modal';
import { uploadReviewImages } from '@/service/customer/reviewImageService';



export default function EditReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [review, setReview] = useState<ReviewResponseDTO | null>(null);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [tempRating, setTempRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 이미지 상태 관리
  const [existingImages, setExistingImages] = useState<string[]>([]); // DB에 저장된 기존 이미지 URL
  const [newImages, setNewImages] = useState<File[]>([]); // 새로 추가할 이미지 파일들
  const [removedImages, setRemovedImages] = useState<string[]>([]); // 삭제된 기존 이미지 URL들 (DB 반영용)

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

  // 새 이미지 파일 선택 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('files:', files);
    if (files && files.length > 0) {
      const arrFiles = Array.from(files);
      console.log('Array.from(files):', arrFiles);
      setNewImages((prev) => [...prev, ...arrFiles]);
    }
    e.target.value = '';
  };



  // 기존 이미지 삭제 (프론트에서만 삭제 표시)
  const handleRemoveExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  // 새로 추가한 이미지 미리보기 삭제
  const handleRemoveNewImage = (file: File) => {
    setNewImages((prev) => prev.filter((f) => f !== file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !review) return;

    try {
      setLoading(true);

      console.log('기존 이미지:', existingImages);
      console.log('삭제된 이미지:', removedImages);
      console.log('새로 추가한 이미지 파일들:', newImages);

      const uploadedUrls = await uploadReviewImages(newImages, Number(id));
      console.log('업로드 완료된 이미지 URL들:', uploadedUrls);

      const filteredExisting = existingImages.filter((url) => !removedImages.includes(url));
      console.log('삭제 제외된 기존 이미지들:', filteredExisting);

      const finalImageUrls = [...filteredExisting, ...uploadedUrls];
      console.log('서버에 전송할 최종 이미지 URL 목록:', finalImageUrls);

      await updateReview(Number(id), {
        content,
        rating,
        imageUrls: finalImageUrls,
      });

      setShowSuccess(true);
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

          {/* 이미지 업로드 및 미리보기 */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">이미지 첨부</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full border rounded-md text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
            />
          </div>

          {/* 기존 이미지 미리보기 및 삭제 버튼 */}
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {existingImages.map((url) => (
                <div key={url} className="relative w-24 h-24 border rounded overflow-hidden">
                  <img
                    src={url}
                    alt="기존 리뷰 이미지"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(url)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-800"
                    title="이미지 삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 새로 추가된 이미지 미리보기 및 삭제 버튼 */}
          {newImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {newImages.map((file) => {
                const objectUrl = URL.createObjectURL(file);
                const key = file.name + '_' + file.lastModified; // 좀 더 고유하게
                return (
                  <div key={key} className="relative w-24 h-24 border rounded overflow-hidden">
                    <img src={objectUrl} alt="새 리뷰 이미지" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(file)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-800"
                      title="이미지 삭제"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </form>
      </div>
    </div>
  );
}
