import apiClient from '@/lib/apiClient';

export async function getReviewSummary() {
    const res = await apiClient.get('/customer/reviews/summary');
    return res.data;
}
