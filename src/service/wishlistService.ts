import apiClient from '@/lib/apiClient';
import {
    WishlistToggleRequest,
    WishlistToggleResponse,
} from '@/types/wishlist';
import { ProductListDTO } from '@/types/product';

export async function toggleWishlist(
    data: WishlistToggleRequest
): Promise<WishlistToggleResponse> {
    const res = await apiClient.post('/customer/wishlist/toggle', data);
    return res.data;
}

export async function fetchWishlist(): Promise<ProductListDTO[]> {
    const res = await apiClient.get('/customer/wishlist/my');
    return res.data;
}