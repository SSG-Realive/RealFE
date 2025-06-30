'use client'

// React 및 Next.js 훅 임포트
import { useState, useEffect, FormEvent, useCallback } from 'react'
import { useParams } from 'next/navigation'

// 서비스 및 타입 임포트
import { customerAuctionService, customerBidService } from '@/service/customer/auctionService'
import type { Auction, Bid } from '@/types/customer/auctions'

// 하위 컴포넌트 임포트
import AuctionCard from '@/components/customer/auctions/AuctionCard'
import useDialog from '@/hooks/useDialog'
import useConfirm from '@/hooks/useConfirm'
import GlobalDialog from '@/components/ui/GlobalDialog'


export default function AuctionDetailPage() {
  // 훅 및 상태 관리
  const params = useParams()
  const [auction, setAuction] = useState<Auction | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [otherAuctions, setOtherAuctions] = useState<Auction[]>([])
  const [tickSize, setTickSize] = useState<number | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [bidError, setBidError] = useState<string | null>(null)
const { open, message, show, setOpen } = useDialog();
const { confirm, dialog } = useConfirm();   // ✅
  // auctionId를 params로부터 안전하게 추출
  const auctionId = Number(Array.isArray(params.id) ? params.id[0] : params.id)

  // 데이터 페칭 로직을 useCallback으로 감싸 컴포넌트 전체에서 재사용
  const fetchData = useCallback(async () => {
    if (isNaN(auctionId) || auctionId <= 0) {
    show('유효하지 않은 경매 ID입니다.')
      setIsLoading(false)
      return
    }

    setIsLoading(true);
    try {
      const [
        auctionDetails, 
        bidsResponse, 
        otherAuctionsResponse,
        tickSizeResponse
      ] = await Promise.all([
        customerAuctionService.getAuctionById(auctionId),
        customerBidService.getBidsByAuction(auctionId, { page: 0, size: 20 }),
        customerAuctionService.getAuctions({ status: 'PROCEEDING', size: 10 }),
        customerBidService.getTickSize(auctionId)
      ]);
      
      setAuction(auctionDetails)
      setBids(bidsResponse.content)
      setTickSize(tickSizeResponse)
      
      const filteredOtherAuctions = otherAuctionsResponse.content.filter(
        (a: Auction) => a.id !== auctionId
      )
      setOtherAuctions(filteredOtherAuctions)

    } catch (err: any) {
      show(err.response?.data?.message || '데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false)
    }
  }, [auctionId]);

  // 컴포넌트 마운트 시 데이터 페칭 함수 호출
  useEffect(() => {
    fetchData()
  }, [fetchData])


  // 입찰 제출 처리 함수
  const handleBidSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBidError(null)

    if (!auction || !bidAmount || !tickSize) {
      show('입찰 금액을 입력해주세요.')
      return
    }

    const amount = Number(bidAmount);
    const minBid = auction.currentPrice + tickSize;

    // 입찰 유효성 검사
    if (isNaN(amount) || amount <= 0) {
       show(`최소 입찰가: ${minBid.toLocaleString()}원`);
      return
    }
    const minBidAmount = auction.currentPrice + tickSize;
    if (amount < minBidAmount) {
        show(`현재가보다 높은 금액을 입찰해야 합니다. (최소 입찰가: ${minBidAmount.toLocaleString()}원)`);
        return;
    }
    if ((amount - auction.currentPrice) % tickSize !== 0) {
        show(`입찰은 현재가에서 ${tickSize.toLocaleString()}원 단위로 가능합니다.`);
        return;
    }
    const ok = await confirm(`${amount.toLocaleString()}원에 입찰하시겠습니까?`);
    if (!ok) return;

    try {
      // 로그인된 유저만 입찰 가능 (axios 인터셉터에 토큰 설정 필요)
      await customerBidService.placeBid({
          auctionId: auction.id,
          bidPrice: amount
      });

      show(`${amount.toLocaleString()}원 입찰에 성공했습니다!`);

      // 입찰 성공 후 데이터 새로고침
      await fetchData(); 
      
      setBidAmount('');

    } catch (err: any) {
      console.error("Failed to place bid:", err);
      show(err.response?.data?.message || "입찰 처리 중 오류가 발생했습니다.");
    }
  }

  // 로딩, 에러, 데이터 없음 상태에 따른 조기 반환 (가드 클로즈)
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>로딩 중...</p></div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>
  }

  if (!auction) {
    return <div className="flex justify-center items-center h-screen"><p>경매 정보를 찾을 수 없습니다.</p></div>
  }

  // 메인 UI 렌더링
  return (
    <>
    {dialog}
    <GlobalDialog open={open} message={message} onClose={() => setOpen(false)} />
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* 상품 이미지 섹션 */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
            <img
              src={auction.adminProduct?.imageUrl || '/images/placeholder.png'}
              alt={auction.adminProduct?.productName || '상품 이미지'}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* 경매 정보 및 입찰 섹션 */}
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">{auction.adminProduct?.productName}</h1>
          
          <div className="border-t pt-4 mt-4">
            <div className="text-lg">
                <p>시작가: <span className="font-semibold">{auction.startPrice.toLocaleString()}원</span></p>
                <p className="text-2xl text-red-600">현재가: <span className="font-bold">{auction.currentPrice.toLocaleString()}원</span></p>
                {tickSize && <p className="text-sm text-gray-600">입찰 단위: {tickSize.toLocaleString()}원</p>}
                <p className="text-sm text-gray-500 mt-1">경매 종료: {new Date(auction.endTime).toLocaleString()}</p>
            </div>
          </div>

          {/* 입찰 폼 */}
          <form onSubmit={handleBidSubmit} className="space-y-3 pt-4">
            <h2 className="text-xl font-semibold">입찰하기</h2>
            <div>
              <label htmlFor="bidAmount" className="sr-only">입찰 금액</label>
              <input
                type="number"
                id="bidAmount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={tickSize ? `최소 ${(auction.currentPrice + tickSize).toLocaleString()}원` : '입찰 금액 입력'}
                min={auction.currentPrice + (tickSize || 1)}
                step={tickSize || 1}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            {bidError && <p className="text-red-500 text-sm">{bidError}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300 disabled:bg-gray-400"
              disabled={auction.status !== 'PROCEEDING' || isLoading}
            >
              {auction.status === 'PROCEEDING' ? '입찰하기' : '경매 종료'}
            </button>
          </form>

          {/* 입찰 내역 */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">입찰 내역</h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {bids.length > 0 ? (
                bids.map((bid) => (
                  <li key={bid.id} className={`flex justify-between p-2 rounded ${bid.isWinning ? 'bg-yellow-100' : 'bg-gray-50'}`}>
                    <span>{bid.customerName || `사용자 ${bid.customerId}`}</span>
                    <span className="font-semibold">{bid.bidPrice.toLocaleString()}원</span>
                    <span className="text-sm text-gray-500">{new Date(bid.bidTime).toLocaleTimeString()}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">아직 입찰 내역이 없습니다.</p>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 다른 경매 목록 슬라이더 */}
      {otherAuctions.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">진행중인 다른 경매</h2>
          <AuctionCard auctions={otherAuctions} />
        </div>
      )}
    </div>
    </>
  )
}