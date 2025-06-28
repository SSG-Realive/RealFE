//service/customer/auctionService.ts


import apiClient from "@/lib/apiClient";
import { Auction, Bid, PaginatedAuctionResponse, PaginatedBidResponse, PlaceBidRequest,  } from "@/types/customer/auctions";

const BASE_URL = '/customer';

// 경매 정보 관련 서비스
export const customerAuctionService = {
  /**
   * 활성화된 경매 목록을 필터와 함께 조회 (페이지네이션)
   * GET /api/customer/auctions
   */
  async getAuctions(params?: { page?: number; size?: number; category?: string; status?: string }): Promise<PaginatedAuctionResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.size) searchParams.append('size', params.size.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);

    const response = await apiClient.get(`${BASE_URL}/auctions?${searchParams.toString()}`);
    // Spring Page 객체를 프론트엔드 타입으로 매핑
    const pageData = response.data.data;
    return {
      content: pageData.content,
      totalPages: pageData.totalPages,
      number: pageData.number,
      last: pageData.last,
    };
  },

  /**
   * 특정 경매의 상세 정보를 조회
   * GET /api/customer/auctions/{auctionId}
   */
  async getAuctionById(auctionId: number): Promise<Auction> {
    const response = await apiClient.get(`${BASE_URL}/auctions/${auctionId}`);
    return response.data.data;
  },
};

// 입찰 관련 서비스
export const customerBidService = {
  /**
   * 특정 경매의 입찰 내역을 조회 (페이지네이션)
   * GET /api/customer/bids/{auctionId}
   */
  async getBidsByAuction(auctionId: number, params?: { page?: number; size?: number }): Promise<PaginatedBidResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.size) searchParams.append('size', params.size.toString());

    const response = await apiClient.get(`${BASE_URL}/bids/${auctionId}?${searchParams.toString()}`);
    const pageData = response.data.data;
    return {
        content: pageData.content,
        totalPages: pageData.totalPages,
        number: pageData.number,
        last: pageData.last,
      };
  },

  /**
   * 새로운 입찰을 등록 (로그인 필요)
   * POST /api/customer/bids
   */
  async placeBid(bidData: PlaceBidRequest): Promise<Bid> {
    const response = await apiClient.post(`${BASE_URL}/bids`, bidData);
    return response.data.data;
  },

  /**
   * 특정 경매의 최소 입찰 단위를 조회
   * GET /api/customer/bids/auction/{auctionId}/tick-size
   */
  async getTickSize(auctionId: number): Promise<number> {
    const response = await apiClient.get(`${BASE_URL}/bids/auction/${auctionId}/tick-size`);
    return response.data.data;
  },

  /**
   * 나의 입찰 내역을 조회 (로그인 필요)
   * GET /api/customer/bids/my-bids
   */
  async getMyBids(params?: { page?: number; size?: number }): Promise<PaginatedBidResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.size) searchParams.append('size', params.size.toString());

    const response = await apiClient.get(`${BASE_URL}/bids/my-bids?${searchParams.toString()}`);
    const pageData = response.data.data;
    return {
        content: pageData.content,
        totalPages: pageData.totalPages,
        number: pageData.number,
        last: pageData.last,
      };
  },
};