//types/customer/auctions.ts

export interface Auction {
  id: number;
  productId: number;
  startPrice: number;
  currentPrice: number;
  startTime: string;
  endTime: string;
  status: string;
  createdAt?: string;
  adminProduct: {
    productName: string | null;
    imageUrl?: string | null;
  } | null;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PaginatedAuctionResponse {
  content: Auction[];
  totalPages: number;
  number: number;
  last: boolean;
}

export interface AuctionState {
  auctions: Auction[];
  category: string;
  page: number;
  hasNext: boolean;
  loading: boolean;
  error: string | null;
  lastFetchTime: number; // 중복 요청 방지용
  setCategory: (category: string) => void;
  reset: () => void;
  fetchAuctions: () => Promise<void>;
}

export interface Bid {
  id: number;
  auctionId: number;
  customerId: number;
  customerName: string; // DTO에 따라 추가될 수 있습니다.
  bidPrice: number;
  bidTime: string;
  isWinning: boolean;
  leading?: boolean;
}

export interface PaginatedBidResponse {
  content: Bid[];
  totalPages: number;
  number: number;
  last: boolean;
}

export interface PlaceBidRequest {
  auctionId: number;
  bidPrice: number;
}