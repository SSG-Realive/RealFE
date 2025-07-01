'use client';

/* ──────────── imports ──────────── */
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useParams } from 'next/navigation';

import {
  customerAuctionService,
  customerBidService,
} from '@/service/customer/auctionService';
import type { Auction, Bid } from '@/types/customer/auctions';

import AuctionCard      from '@/components/customer/auctions/AuctionCard';
import GlobalDialog     from '@/components/ui/GlobalDialog';
import useConfirm       from '@/hooks/useConfirm';
import useRequireAuth   from '@/hooks/useRequireAuth';
import { useGlobalDialog } from '@/app/context/dialogContext';
import { useAuthStore } from '@/store/customer/authStore';

/* ───────────────────────────────── */

export default function AuctionDetailPage() {
  /* 로그인 & 사용자 */
  const myId        = useAuthStore((s) => s.id);
  const accessToken = useRequireAuth();

  /* 라우트 파라미터 */
  const { id }     = useParams();
  const auctionId  = Number(Array.isArray(id) ? id[0] : id);

  /* 상태값 */
  const [auction,       setAuction]       = useState<Auction | null>(null);
  const [bids,          setBids]          = useState<Bid[]>([]);
  const [otherAuctions, setOtherAuctions] = useState<Auction[]>([]);
  const [tickSize,      setTickSize]      = useState<number | null>(null);
  const [bidAmount,     setBidAmount]     = useState('');
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [bidError,      setBidError]      = useState<string | null>(null);
  const [isLeading,     setIsLeading]     = useState(false);

  /* 다이얼로그 & confirm */
  const { show, open, message, handleClose } = useGlobalDialog();
  const { confirm, dialog } = useConfirm();

  /* -------------------------------------------------- */
  /* 데이터 불러오기 */
  const fetchData = useCallback(async () => {
    if (isNaN(auctionId) || auctionId <= 0) {
      show('유효하지 않은 경매 ID입니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [
        auctionDetails,
        bidsRes,
        othersRes,
        tickSizeRes,
      ] = await Promise.all([
        customerAuctionService.getAuctionById(auctionId),
        customerBidService.getBidsByAuction(auctionId, { page: 0, size: 20 }),
        customerAuctionService.getAuctions({ status: 'PROCEEDING', size: 10 }),
        customerBidService.getTickSize(auctionId),
      ]);

      setAuction(auctionDetails);
      setBids(bidsRes.content);
      setTickSize(tickSizeRes);

      const filtered = othersRes.content.filter((a) => a.id !== auctionId);
      setOtherAuctions(filtered);

      /* 최고 입찰자인지 계산 */
      if (bidsRes.content.length) {
        const topBid = bidsRes.content.reduce(
          (max, cur) => (cur.bidPrice > max.bidPrice ? cur : max),
          bidsRes.content[0],
        );
        setIsLeading(topBid.customerId === myId);
      } else {
        setIsLeading(false);
      }
    } catch (err: any) {
      show(err.response?.data?.message || '데이터를 불러오는 데 실패했습니다.');
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [auctionId, myId, show]);

  useEffect(() => {
    if (accessToken) fetchData();
  }, [accessToken, fetchData]);

  if (!accessToken) return null;

  /* -------------------------------------------------- */
  /* 파생값 - 실시간 검증 */
  const currentPrice = auction?.currentPrice ?? 0;
  const minBid       = tickSize ? currentPrice + tickSize : 0;
  const amount       = Number(bidAmount);
  const isNumber     = !isNaN(amount) && amount > 0;
  const isStepOK     = isNumber && tickSize ? (amount - currentPrice) % tickSize === 0 : true;
  const isAboveMin   = isNumber && amount >= minBid;
  const amountValid  = isNumber && isStepOK && isAboveMin;

  let helperText = '';
  if (!isNumber && bidAmount) helperText = '숫자를 입력하세요.';
  else if (!isAboveMin)       helperText = `최소 ${minBid.toLocaleString()}원 이상`;
  else if (!isStepOK)         helperText = `${tickSize?.toLocaleString()}원 단위로 입력`;

  const btnDisabled =
    auction?.status !== 'PROCEEDING' || isLoading || isLeading || !amountValid;

  /* -------------------------------------------------- */
  /* 입찰 제출 */
  const handleBidSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBidError(null);

    if (btnDisabled) return;

    const ok = await confirm(`${amount.toLocaleString()}원에 입찰하시겠습니까?`);
    if (!ok) return;

    try {
      await customerBidService.placeBid({ auctionId: auction!.id, bidPrice: amount });
      show(`${amount.toLocaleString()}원 입찰에 성공했습니다!`);
      setBidAmount('');
      await fetchData();
    } catch (err: any) {
      const res = err.response;
      if (res?.status === 400 && res.data?.error?.code === 'BID_TOO_LOW') {
        show('입찰 금액이 최소 입찰가보다 낮습니다.');
      } else {
        show(res?.data?.error?.message || '입찰 처리 중 오류가 발생했습니다.');
      }
    }
  };

  /* -------------------------------------------------- */
  /* 로딩 / 에러 처리 */
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">로딩 중…</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }
  if (!auction) {
    return <div className="flex justify-center items-center h-screen">경매 정보를 찾을 수 없습니다.</div>;
  }

  /* -------------------------------------------------- */
  /* UI */
  return (
    <>
      {dialog}
      <GlobalDialog open={open} message={message} onClose={handleClose} />

      <div className="container mx-auto p-4 md:p-8">
        {/* ---------- 상단 ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 이미지 */}
          <div>
            <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
              <img
                src={auction.adminProduct?.imageUrl || '/images/placeholder.png'}
                alt={auction.adminProduct?.productName || '상품 이미지'}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 정보 + 입찰 */}
          <div className="flex flex-col space-y-4">
            <h1 className="text-3xl font-light">{auction.adminProduct?.productName}</h1>

            <div className="border-t pt-4 mt-4 text-lg space-y-1">
              <p>시작가: <span className="font-light">{auction.startPrice.toLocaleString()}원</span></p>
              <p className="text-2xl text-red-600">
                현재가: <span className="font-light">{currentPrice.toLocaleString()}원</span>
              </p>
              {tickSize && <p className="text-sm text-gray-600">입찰 단위: {tickSize.toLocaleString()}원</p>}
              <p className="text-sm text-gray-500">경매 종료: {new Date(auction.endTime).toLocaleString()}</p>
            </div>

            {/* 입찰 폼 */}
            <form onSubmit={handleBidSubmit} className="space-y-3 pt-4">
              <h2 className="text-xl font-light">입찰하기</h2>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={
                  tickSize ? `최소 ${minBid.toLocaleString()}원` : '입찰 금액 입력'
                }
                min={minBid}
                step={tickSize || 1}
                className="w-full px-4 py-2 border rounded-md focus:outline-none
                           focus:ring-2 focus:ring-indigo-500"
                required
              />
              {helperText && <p className="text-sm text-red-500">{helperText}</p>}

              <button
                type="submit"
                disabled={btnDisabled}
                className="w-full bg-indigo-600 text-white font-light py-3 rounded-md
                           hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isLeading
                  ? '최고 입찰자입니다'
                  : auction.status === 'PROCEEDING'
                    ? '입찰하기'
                    : '경매 종료'}
              </button>
            </form>

            {/* 입찰 내역 */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-light mb-2">입찰 내역</h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {bids.length ? (
                  bids.map((b) => (
                    <li
                      key={b.id}
                      className={`flex justify-between p-2 rounded
                        ${b.customerId === myId ? 'bg-blue-50' : 'bg-gray-50'}`}
                    >
                      <span>{b.customerName || `사용자 ${b.customerId}`}</span>
                      <span className="font-light">{b.bidPrice.toLocaleString()}원</span>
                      <span className="text-sm text-gray-500">
                        {new Date(b.bidTime).toLocaleTimeString()}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">아직 입찰 내역이 없습니다.</p>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* ---------- 다른 경매 ---------- */}
        {otherAuctions.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-light mb-4">진행중인 다른 경매</h2>
            <AuctionCard auctions={otherAuctions} />
          </section>
        )}
      </div>
    </>
  );
}
