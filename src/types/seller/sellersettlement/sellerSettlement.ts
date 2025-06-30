export interface SellerSettlementResponse {
    id: number;
    sellerId: number;
    periodStart: string;
    periodEnd: string;
    totalSales: number;
    totalCommission: number;
    payoutAmount: number;
    processedAt: string;
}

// 정산 상세 정보를 위한 새로운 타입들
export interface PayoutLogDetailResponse {
    payoutInfo: PayoutLogInfo;
    salesDetails: SalesWithCommissionDetail[];
}

export interface PayoutLogInfo {
    id: number;
    sellerId: number;
    periodStart: string;
    periodEnd: string;
    totalSales: number;
    totalCommission: number;
    payoutAmount: number;
    processedAt: string;
}

export interface SalesWithCommissionDetail {
    salesLog: SalesLogDetail;
    commissionLog: CommissionLogDetail;
}

export interface SalesLogDetail {
    id: number;
    orderItemId: number;
    productId: number;
    sellerId: number;
    customerId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    soldAt: string;
    productName?: string;  // 상품명 추가
    customerName?: string; // 고객명 추가
}

export interface CommissionLogDetail {
    id: number;
    salesLogId: number;
    commissionRate: number;
    commissionAmount: number;
    recordedAt: string;
}