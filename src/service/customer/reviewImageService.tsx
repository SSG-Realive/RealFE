import apiClient from '@/lib/apiClient';

export async function uploadReviewImages(
  files: File[] | null | undefined,
  reviewId?: number
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const urls: string[] = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = reviewId
        ? `/customer/reviews/images/upload?reviewId=${reviewId}`
        : `/customer/reviews/images/upload`;

      const res = await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data.url ?? res.data;
      urls.push(uploadedUrl);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  }

  return urls;
}

export async function deleteReviewImage(imageUrl: string): Promise<void> {
  await apiClient.delete('/customer/reviews/images/delete', {
    params: { imageUrl },
  });
}
