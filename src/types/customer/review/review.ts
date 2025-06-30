export interface ReviewResponseDTO {
    reviewId: number;
    orderId: number;
    customerId: number;
    sellerId: number;
    productName: string;
    rating: number;
    content: string;
    imageUrls: string[];
    createdAt: string;
    isHidden: boolean;
}

export interface ReviewCreateRequestDTO {
  orderId: number;
  sellerId: number;
  rating: number;
  content: string;
  imageUrls: string[];
}
