// 챗봇이 모든 service를 사용 가능하도록 설정하기위한 파일

export * from './categoryService'
export * from './productService'
export * from './customer/productService'
export * from './customer/customerService'
export * from './customer/cartService'
export * from './customer/auctionService'
export * from './customer/logoutService'
export * from './customer/publicAuctionService'
export * from './customer/reviewService'
export * from './customer/wishlistService'
export * from './customer/wonAuctionService'
export * from './customer/customerQnaService'
export * from './customer/reviewImageService'
export * from './order/orderService'
export * from './order/tossPaymentService'
export * from './seller/adminInquiryService'
export * from './seller/customerQnaService'
export * from './seller/deliveryService'
export {
    fetchMyProducts as fetchSellerProducts,
    createProduct as createSellerProduct,
    updateProduct as updateSellerProduct,
    getProductDetail as getSellerProductDetail,
    getMyProducts as getSellerMyProducts,
    deleteProduct as deleteSellerProduct,
    fetchCategories as fetchSellerCategories,
    getMyProductStats as getSellerProductStats,
} from './seller/productService';
export * from './seller/reviewService'
export {
    getSellerOrders as fetchSellerOrders,
    getOrderDetail as fetchSellerOrderDetail,
    updateDeliveryStatus as updateSellerOrderDeliveryStatus,
    cancelOrderDelivery as cancelSellerOrderDelivery,
} from './seller/sellerOrderService';
export * from './seller/sellerQnaService'
export {
    login as loginSeller,
    logout as logoutSeller,
    getProfile as getSellerProfile,
    updateProfile as updateSellerProfile,
    getDashboard as getSellerDashboard,
    getSalesStatistics as getSellerSalesStatistics,
    getDailySalesTrend as getSellerDailySalesTrend,
    getMonthlySalesTrend as getSellerMonthlySalesTrend,
    getSellerPublicInfoList,
    getSellerPublicInfo,
    getSellerReviews,
    getSellerProducts,
} from './seller/sellerService';
export * from './seller/sellerSettlementService'
export * from './seller/signupService'
export * from './seller/logoutService'