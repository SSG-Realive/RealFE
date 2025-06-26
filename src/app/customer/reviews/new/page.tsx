'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

function ReviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 주문 ID와 판매자 ID는 URL 파라미터에서 가져옴
    const orderIdParam = searchParams.get('orderId');
    const sellerIdParam = searchParams.get('sellerId');

    const [orderId, setOrderId] = useState<number | null>(null);
    const [sellerId, setSellerId] = useState<number | null>(null);
    const [rating, setRating] = useState<number>(5);
    const [content, setContent] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (orderIdParam) setOrderId(Number(orderIdParam));
        if (sellerIdParam) setSellerId(Number(sellerIdParam));
    }, [orderIdParam, sellerIdParam]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setImages(files);
    };

    const uploadImages = async () => {
        const urls: string[] = [];
        for (const file of images) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await axios.post('/api/uploads', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                urls.push(res.data.url); // 이미지 업로드 후 반환되는 URL
            } catch (err) {
                console.error('이미지 업로드 실패:', err);
            }
        }
        return urls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId || !sellerId) {
            setMessage('주문 ID 또는 판매자 ID가 누락되었습니다.');
            return;
        }
        setLoading(true);
        try {
            const uploadedUrls = await uploadImages();
            const payload = {
                orderId,
                sellerId,
                rating,
                content,
                imageUrls: uploadedUrls,
            };
            await axios.post('/api/reviews', payload);
            setMessage('리뷰가 성공적으로 등록되었습니다.');
            router.push('/customer/reviews/my');
        } catch (error) {
            console.error('리뷰 등록 실패:', error);
            setMessage('리뷰 등록 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-xl mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">리뷰 작성</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">평점 (0.5 단위)</label>
                    <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full border rounded px-3 py-2"
                        required
                    >
                        {[...Array(9)].map((_, i) => {
                            const val = (i + 2) / 2; // 1.0 ~ 5.0
                            return (
                                <option key={val} value={val}>
                                    {val}점
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div>
                    <label className="block mb-1">내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full border rounded px-3 py-2 h-32"
                        required
                    ></textarea>
                </div>
                <div>
                    <label className="block mb-1">이미지 첨부</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="block"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {loading ? '등록 중...' : '리뷰 등록'}
                </button>
                {message && <p className="mt-2 text-red-500">{message}</p>}
            </form>
        </div>
    );
}

export default ReviewPage;