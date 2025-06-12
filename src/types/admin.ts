export interface AdminDashboardDTO {
  queryDate: string;
  periodType: string;
  pendingSellerCount: number;
  productLog: ProductLogDTO;
  penaltyLogs: PenaltyLogDTO[];
  memberSummaryStats: MemberSummaryStatsDTO;
  salesSummaryStats: SalesSummaryStatsDTO;
  auctionSummaryStats: AuctionSummaryStatsDTO;
  reviewSummaryStats: ReviewSummaryStatsDTO;
}

export interface ProductLogDTO {
  salesWithCommissions: SalesWithCommissionDTO[];
  payoutLogs: PayoutLogDTO[];
}

export interface SalesWithCommissionDTO {
  salesLog: SalesLogDTO;
  commissionLog: CommissionLogDTO;
}

export interface SalesLogDTO {
  id: number;
  orderItemId: number;
  productId: number;
  sellerId: number;
  customerId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  soldAt: string;
}

export interface CommissionLogDTO {
  id: number;
  salesLogId: number;
  commissionRate: number;
  commissionAmount: number;
  recordedAt: string;
}

export interface PayoutLogDTO {
  id: number;
  sellerId: number;
  periodStart: string;
  periodEnd: string;
  totalSales: number;
  totalCommission: number;
  payoutAmount: number;
  processedAt: string;
}

export interface PenaltyLogDTO {
  id: number;
  customerId: number;
  reason: string;
  points: number;
  description: string;
  createdAt: string;
}

export interface MemberSummaryStatsDTO {
  totalMembers: number;
  newMembersInPeriod: number;
  uniqueVisitorsInPeriod: number;
  engagedUsersInPeriod: number;
  activeUsersInPeriod: number;
}

export interface SalesSummaryStatsDTO {
  totalOrdersInPeriod: number;
  totalRevenueInPeriod: number;
  totalFeesInPeriod: number;
}

export interface AuctionSummaryStatsDTO {
  totalAuctionsInPeriod: number;
  totalBidsInPeriod: number;
  averageBidsPerAuctionInPeriod: number;
  successRate: number;
  failureRate: number;
}

export interface ReviewSummaryStatsDTO {
  totalReviewsInPeriod: number;
  newReviewsInPeriod: number;
  averageRatingInPeriod: number;
  deletionRate: number;
} 