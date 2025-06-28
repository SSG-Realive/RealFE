import Link from "next/link";

interface AuctionCardProps {
  auction: Auction | null | undefined;
  isLast: boolean;
  refCallback: (node: HTMLLIElement | null) => void;
  isLoggedIn?: boolean;
}

export default function AuctionCard({ auction, isLast, refCallback, isLoggedIn = false }: AuctionCardProps) {
  if (!auction) {
    // auction 자체가 없으면 빈 li 반환하거나 로딩/에러 UI 표시 가능
    return (
      <li className="border border-gray-300 rounded-md p-2 bg-white shadow flex flex-col h-full">
        <p>경매 정보가 없습니다.</p>
      </li>
    );
  }

  const { id, startPrice, currentPrice, endTime, status, adminProduct } = auction;
  const productName = adminProduct?.productName ?? '상품 없음';
  const imageUrl = adminProduct?.imageUrl ?? '/images/placeholder.png';

  // 경매 종료까지 남은 시간 계산
  const timeRemaining = endTime ? new Date(endTime).getTime() - new Date().getTime() : 0;
  const isEnding = timeRemaining > 0 && timeRemaining < 24 * 60 * 60 * 1000; // 24시간 미만

  return (
    <li
      ref={isLast ? refCallback : null}
      className="border border-gray-300 rounded-md p-3 bg-white shadow hover:shadow-lg transition-shadow flex flex-col h-full"
    >
      <Link href={`/main/auctions/${id}`} className="flex flex-col flex-grow text-inherit no-underline">
        {/* 이미지 영역 */}
        <div className="h-36 mb-3 bg-gray-200 rounded overflow-hidden relative">
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).src = '/placeholder.png')}
          />
          {/* 상태 배지 */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              status === 'PROCEEDING' 
                ? (isEnding ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800')
                : 'bg-gray-100 text-gray-800'
            }`}>
              {status === 'PROCEEDING' ? (isEnding ? '마감임박' : '진행중') : status}
            </span>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{productName}</h3>
          
          <div className="space-y-1 text-sm text-gray-600 mb-3">
            <p>시작가: <span className="font-medium text-gray-900">{startPrice?.toLocaleString() ?? '-'}원</span></p>
            <p>현재가: <span className="font-bold text-blue-600">{currentPrice?.toLocaleString() ?? '-'}원</span></p>
            <p>종료일: {endTime ? new Date(endTime).toLocaleDateString() : '-'}</p>
          </div>
        </div>
      </Link>

      {/* 하단 액션 영역 */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        {isLoggedIn ? (
          <div className="flex gap-2">
            <Link 
              href={`/main/auctions/${id}`}
              className="flex-1 text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              입찰하기
            </Link>
            <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              ♡
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Link 
              href="/login"
              className="inline-block w-full py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              로그인 후 입찰 가능
            </Link>
          </div>
        )}
      </div>
    </li>
  );
}
