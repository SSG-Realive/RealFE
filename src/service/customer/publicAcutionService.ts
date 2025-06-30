// service/public/publicAuctionService.ts

import customerApi from '@/lib/apiClient';

// ✅ 기존 타입을 그대로 사용합니다.
import type { Auction, PaginatedAuctionResponse, ApiResponse as OldApiResponse } from '@/types/customer/auctions';
import { BackendApiResponse, SpringPage } from '@/types/public/auctions';
// ✅ 백엔드의 실제 응답 구조를 임시로 정의합니다. (이 파일 안에서만 사용)
; 

/**
 * 공개된 경매 목록을 가져와서, 프론트엔드가 사용하던 PaginatedAuctionResponse 형태로 변환하여 반환합니다.
 */
const fetchPublicActiveAuctions = async (): Promise<PaginatedAuctionResponse> => {
    // 1. 서버에 요청할 때는, 실제 백엔드 응답 타입(BackendApiResponse<SpringPage<Auction>>)을 기대합니다.
    const response = await customerApi.get<BackendApiResponse<SpringPage<Auction>>>(
        '/public/auctions?status=PROCEEDING&size=10&sort=endTime,asc'
    );
     console.log('1. 서버에서 받은 원본 응답:', response.data);

    // 2. 응답이 성공적이고 데이터가 존재할 때
    if (response.data && response.data.data && response.data.data.content)  {
        const backendPageData = response.data.data; // 실제 Spring Page 객체

        // ✅ 3. 기존 PaginatedAuctionResponse 형태에 맞게 데이터를 "재조립"하여 반환합니다.
        return {
            content: backendPageData.content,
            totalPages: backendPageData.totalPages,
            number: backendPageData.number,
            last: backendPageData.last,
        };
    }
    
    // 4. 실패했거나 데이터가 없을 경우, 기본 빈 값 반환
    return {
        content: [],
        totalPages: 0,
        number: 0,
        last: true,
    };
};

export const publicAuctionService = {
    fetchPublicActiveAuctions,
};