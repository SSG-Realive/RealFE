'use client';

import { useEffect, useState } from 'react';
// import { useAuctionStore } from '@/store/customer/auctionStore';
// import AuctionCard, { AuctionItemCard } from '@/components/customer/auctions/AuctionCard';
// import CategoryFilter from '@/components/customer/auctions/CategoryFilter';
// import Link from 'next/link';

// export default function MainAuctionsPage() {
//   const { auctions, loading, fetchAuctions, category, setCategory, setLoginStatus } = useAuctionStore();
//   const { isAuthenticated, userName } = useAuthStore();
//   const [mounted, setMounted] = useState(false);

//   // 클라이언트 사이드에서만 실행되도록 보장
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // 로그인 상태를 경매 스토어에 전달
//   useEffect(() => {
//     if (mounted) {
//       const loggedIn = isAuthenticated();
//       setLoginStatus(loggedIn);
//     }
//   }, [mounted, isAuthenticated, setLoginStatus]);

//   // 경매 데이터 fetch
//   useEffect(() => {
//     if (mounted) {
//       fetchAuctions();
//     }
//   }, [mounted, fetchAuctions]);

//   useEffect(() => {
//     if (mounted && category) {
//       fetchAuctions();
//     }
//   }, [mounted, category, fetchAuctions]);

//   if (!mounted) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-lg">로딩 중...</div>
//       </div>
//     );
//   }

//   if (loading && auctions.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-lg">경매 목록을 불러오는 중...</div>
//       </div>
//     );
//   }

//   const loggedIn = isAuthenticated();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8">
//           <div className="flex justify-between items-center mb-4">
//             <h1 className="text-3xl font-bold text-gray-900">진행중인 경매</h1>
//             {loggedIn && (
//               <div className="text-sm text-gray-600">
//                 환영합니다, {userName}님! 
//               </div>
//             )}
//           </div>
//           <CategoryFilter 
//             category={category}
//             onChange={setCategory}
//             disabled={loading}
//           />
//         </div>

//         {/* 비로그인 사용자 안내 배너 */}
//         {!loggedIn && (
//           <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h3 className="text-lg font-semibold text-blue-900 mb-1">
//                   🎯 경매에 참여하고 싶으신가요?
//                 </h3>
//                 <p className="text-blue-700">
//                   로그인하시면 입찰 참여, 관심 경매 등록, 내 입찰 내역 확인이 가능합니다!
//                 </p>
//               </div>
//               <div className="flex gap-2">
//                 <Link 
//                   href="/login" 
//                   className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//                 >
//                   로그인
//                 </Link>
//                 <Link 
//                   href="/customer/signup" 
//                   className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
//                 >
//                   회원가입
//                 </Link>
//               </div>
//             </div>
//           </div>
//         )}

//         {auctions.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-gray-500 text-lg">진행중인 경매가 없습니다.</p>
//           </div>
//         ) : (
//           <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {auctions.map((auction) => (
//               <AuctionItemCard
//                 key={auction.id}
//                 auction={auction}
//               />
//             ))}
//           </ul>
//         )}

//         {/* 로딩 중일 때 표시 */}
//         {loading && auctions.length > 0 && (
//           <div className="text-center py-4">
//             <div className="text-gray-500">더 많은 경매를 불러오는 중...</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// } 