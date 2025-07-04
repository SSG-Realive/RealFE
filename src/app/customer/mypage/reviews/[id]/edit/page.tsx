'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchReviewDetail, updateReview } from '@/service/customer/reviewService';
import { uploadReviewImages, deleteReviewImage } from '@/service/customer/reviewImageService'; // 이미지 API 함수
import { ReviewResponseDTO } from '@/types/customer/review/review';
import StarRating from '@/components/customer/review/StarRating';
import { useGlobalDialog } from '@/app/context/dialogContext';

export default function EditReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [review, setReview] = useState<ReviewResponseDTO | null>(null);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [tempRating, setTempRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {show} = useGlobalDialog();
  // 이미지 관리
  const [existingImages, setExistingImages] = useState<string[]>([]); // 서버에 저장된 기존 이미지 URL 리스트
  const [newImages, setNewImages] = useState<File[]>([]); // 새로 업로드할 이미지 파일들
  const [removedImages, setRemovedImages] = useState<string[]>([]); // 삭제 요청 이미지 URL 리스트

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

      // 1. 삭제 요청된 이미지 서버에서 삭제 API 호출
      await Promise.all(
          removedImages.map((url) => deleteReviewImage(url))
      );

      // 2. 새 이미지 업로드 (uploadReviewImages가 이미지 URL 배열 반환)
      const uploadedUrls = await uploadReviewImages(Number(id), newImages);

      const imageUrls = [...existingImages, ...uploadedUrls];

      // 3. 기존 남은 이미지 + 새 업로드된 이미지 모두 합침
      const finalImageUrls = [...existingImages, ...uploadedUrls];

      // 4. 리뷰 본문 및 평점 수정 API 호출 (이미지는 별도로 저장한다고 가정)
      await updateReview(Number(id), {
        content,
        rating,
        imageUrls,
      });

      // 이미지 변경사항 서버 DB 반영이 필요하면 별도 API 호출 로직 추가

      show('리뷰가 수정되었습니다.');
      router.push(`/customer/mypage/reviews/${id}`);
    } catch (err) {
      console.error(err);
      show('리뷰 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!review) return <div>리뷰가 존재하지 않습니다.</div>;

  return (
      <div>
        <div className="max-w-2xl mx-auto px-6 py-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <StarRating rating={rating} setRating={setRating} setTempRating={setTempRating} />
            </div>


            <div>
              <label className="block font-light mb-2 text-gray-700">리뷰 내용</label>
              <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="border border-gray-300 rounded px-4 py-3 w-full min-h-[140px] text-gray-800"
                  placeholder="리뷰 내용을 입력하세요."
              />
            </div>

            {/* <div>
            <label className="block font-semibold mb-2 text-gray-700">기존 이미지</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {existingImages.map((url) => (
                <div key={url} className="relative w-24 h-24 border rounded overflow-hidden">
                  <img src={`${process.env.NEXT_PUBLIC_API_ROOT_URL ?? ''}${url}`} alt="기존 리뷰 이미지" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(url)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {existingImages.length === 0 && <p className="text-gray-500">이미지가 없습니다.</p>}
            </div>

            <label className="block font-semibold mb-2 text-gray-700">새 이미지 추가</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="mb-4"
            />
            <div className="flex flex-wrap gap-3">
              {newImages.map((file) => {
                const objectUrl = URL.createObjectURL(file);
                return (
                  <div key={file.name + file.size} className="relative w-24 h-24 border rounded overflow-hidden">
                    <img src={objectUrl} alt="새 이미지 미리보기" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(file)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-1 text-xs"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div> */}

            <button
                type="submit"
                className="w-full px-6 py-3 bg-black text-white rounded-none hover:bg-gray-800 transition-colors duration-200"
            >
              저장
            </button>
          </form>
        </div>
      </div>
  );
}