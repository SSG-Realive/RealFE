import  { sellerApi } from '@/lib/apiClient';
import { SellerSettlementResponse, PayoutLogDetailResponse } from '@/types/seller/sellersettlement/sellerSettlement';

/**
 * 판매자 정산 내역 전체 조회
 */
export async function getSellerSettlementList(): Promise<SellerSettlementResponse[]> {
    const res = await sellerApi.get('/seller/settlements');
    return res.data;
}

/**
 * 특정 날짜 기준 정산 내역 조회 (periodStart ~ periodEnd 포함 여부 기준)
 * @param date YYYY-MM-DD 형식의 날짜 문자열
 */
export async function getSellerSettlementListByDate(date: string): Promise<SellerSettlementResponse[]> {
    const res = await sellerApi.get(`/seller/settlements/by-date?date=${date}`);
    return res.data;
}

/**
 * 기간별 정산 내역 조회
 * @param from 시작 날짜 (YYYY-MM-DD)
 * @param to 종료 날짜 (YYYY-MM-DD)
 */
export async function getSellerSettlementListByPeriod(from: string, to: string): Promise<SellerSettlementResponse[]> {
    const res = await sellerApi.get(`/seller/settlements/by-period?from=${from}&to=${to}`);
    return res.data;
}

/**
 * 정산 요약 정보 조회
 * @param from 시작 날짜 (YYYY-MM-DD)
 * @param to 종료 날짜 (YYYY-MM-DD)
 */
export async function getSellerSettlementSummary(from: string, to: string): Promise<{
    totalPayoutAmount: number;
    totalCommission: number;
    totalSales: number;
    payoutCount: number;
}> {
    const res = await sellerApi.get(`/seller/settlements/summary?from=${from}&to=${to}`);
    return res.data;
}

/**
 * 정산 상세 정보 조회
 * @param payoutLogId 정산 로그 ID
 */
export async function getSellerSettlementDetail(payoutLogId: number): Promise<PayoutLogDetailResponse> {
    const res = await sellerApi.get(`/seller/settlements/${payoutLogId}/detail`);
    return res.data;
}