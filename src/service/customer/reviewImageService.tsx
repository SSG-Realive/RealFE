import apiClient from '@/lib/apiClient';

// 이미지 업로드 - Multipart/form-data 방식
// reviewId: 리뷰 ID, files: 업로드할 File[] (input file에서 받은 파일 배열)
export async function uploadReviewImages(reviewId: number, files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);  // 서버 Multipart 'files' 이름 기준
  });

  const res = await apiClient.post(`/customer/reviews/images/upload?reviewId=${reviewId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // 서버에서 반환하는 이미지 URL 배열이라 가정
  return res.data;
}

// 이미지 삭제 - 이미지 URL 또는 ID를 서버에 전달해서 삭제 요청
// imageUrl: 삭제할 이미지 URL 또는 imageId 등 서버 API에 맞게 조정 필요
export async function deleteReviewImage(imageUrl: string): Promise<void> {
  await apiClient.delete('/customer/reviews/images/delete', {
    params: { imageUrl }, // 서버가 url 기준 삭제 처리할 경우
  });
}
