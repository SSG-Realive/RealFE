"use client";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Gavel, 
  ArrowLeft,
  Package,
  Calendar,
  Save,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminAuctionService } from '@/service/admin/auctionService';
import { AuctionResponseDTO } from '@/types/admin/auction';
import { AuctionUpdateRequestDTO } from '@/types/admin/auction';

export default function AuctionEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [auction, setAuction] = useState<AuctionResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 수정할 데이터
  const [endTime, setEndTime] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchAuctionDetail();
    }
  }, [id]);

  const fetchAuctionDetail = async () => {
    try {
      setLoading(true);
      const data = await adminAuctionService.getAuctionById(id);
      setAuction(data);
      
      // 초기값 설정
      setEndTime(data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : '');
      setStatus(data.status || '');
      
      setError(null);
    } catch (err) {
      console.error('경매 상세 정보 조회 실패:', err);
      setError('경매 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!auction) return;

    try {
      setSaving(true);
      
      const updateData: AuctionUpdateRequestDTO = {
        id: auction.id,
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
        status: status as any || undefined
      };

      await adminAuctionService.updateAuction(auction.id, updateData);
      
      alert('경매가 성공적으로 수정되었습니다.');
      router.push(`/admin/auction-management/list/${auction.id}`);
    } catch (err: any) {
      console.error('경매 수정 실패:', err);
      const errorMessage = err.response?.data?.message || '경매 수정에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
    window.location.replace('/admin/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-gray-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">경매 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">오류가 발생했습니다</h3>
          <p className="text-gray-600 text-lg mb-8">{error}</p>
          <Button onClick={fetchAuctionDetail} className="bg-gray-800 hover:bg-gray-700">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">경매를 찾을 수 없습니다</h3>
          <p className="text-gray-600 text-lg mb-8">요청하신 경매 정보가 존재하지 않습니다.</p>
          <Link href="/admin/auction-management/list">
            <Button className="bg-gray-800 hover:bg-gray-700">
              목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <Gavel className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  경매 수정
                </h1>
                <p className="text-gray-600 text-lg mt-2">
                  경매 정보를 수정할 수 있습니다.
                </p>
              </div>
            </div>
            <Link href={`/admin/auction-management/list/${auction.id}`}>
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>상세보기로</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 현재 정보 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>현재 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">상품명</Label>
                  <p className="text-gray-900 mt-1">{auction.adminProduct?.productName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">시작가</Label>
                  <p className="text-gray-900 mt-1">{auction.startPrice?.toLocaleString()}원</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">현재가</Label>
                  <p className="text-blue-600 font-semibold mt-1">{auction.currentPrice?.toLocaleString()}원</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">시작시간</Label>
                  <p className="text-gray-900 mt-1">{new Date(auction.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">현재 상태</Label>
                  <Badge className="mt-1">
                    {auction.statusText || auction.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 수정 폼 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gavel className="w-5 h-5" />
                  <span>수정할 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="endTime">종료시간</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">
                    현재 종료시간: {new Date(auction.endTime).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">상태</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="상태를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROCEEDING">진행중</SelectItem>
                      <SelectItem value="COMPLETED">완료</SelectItem>
                      <SelectItem value="CANCELLED">취소됨</SelectItem>
                      <SelectItem value="FAILED">실패</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    현재 상태: {auction.statusText || auction.status}
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? '저장 중...' : '저장'}</span>
                  </Button>
                  <Link href={`/admin/auction-management/list/${auction.id}`}>
                    <Button variant="outline">
                      취소
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 