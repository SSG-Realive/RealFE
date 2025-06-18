import apiClient from '@/lib/apiClient';
import { ProductListDTO } from '@/types/seller/product/product';
import { ProductDetail } from '@/types/seller/product/product';


 //🔍 [공개] 카테고리별 상품 목록 조회

export async function fetchPublicProducts(
    categoryId: number | null,
    page: number,
    size: number
): Promise<ProductListDTO[]> {
    const query = new URLSearchParams({
        page: String(page),
        size: String(size),
    });

    if (categoryId !== null) {
        query.append('categoryId', String(categoryId));
    }

    const res = await apiClient.get(`/public/items?${query}`);
    return res.data.dtoList; // ✅ PageResponseDTO 내부의 리스트 반환
}


 //* 🔍 [공개] 상품 상세 조회

export async function fetchProductDetail(productId: number): Promise<ProductDetail> {
    const res = await apiClient.get(`/public/items/${productId}`);
    return res.data;
}
