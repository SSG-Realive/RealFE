// 경매 관련 타입 정의
export interface AuctionResponseDTO {
    name: any;
  id: number;
  startPrice: number;
  currentPrice: number;
  startTime: string;
  endTime: string;
  status: string;
  statusText?: string;
  createdAt: string;
  updatedAt: string;
  adminProduct: {
    id: number;
    productId: number;
    productName: string;
    productDescription: string;
    purchasePrice: number;
    purchasedFromSellerId: number | null;
    purchasedAt: string;
    auctioned: boolean;
    imageThumbnailUrl: string;
  };
}

export interface AuctionCreateRequestDTO {
  adminProductId: number;
  startPrice: number;
  startTime: string;
  endTime: string;
}

export interface AuctionUpdateRequestDTO {
  id: number;
  startTime?: string;
  endTime?: string;
}

export interface AuctionCancelResponseDTO {
  auctionId: number;
  status: string;
  cancelledAt: string;
  reason?: string;
}

export interface BidResponseDTO {
  id: number;
  auctionId: number;
  customerId: number;
  customerName: string;
  bidPrice: number;
  bidTime: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface AuctionSearchParams {
  category?: string;
  status?: string;
  page?: number;
  size?: number;
} 