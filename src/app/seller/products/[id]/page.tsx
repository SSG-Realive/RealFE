'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductDetail, deleteProduct } from '@/service/seller/productService';
import { ProductDetail } from '@/types/seller/product/product';
import SellerHeader from '@/components/seller/SellerHeader';
import SellerLayout from '@/components/layouts/SellerLayout';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import { useSellerAuthStore } from '@/store/seller/useSellerAuthStore';
import { ArrowLeft, Edit, Trash2, Package, DollarSign, Layers, Tag, Ruler, Eye, AlertCircle, Star, TrendingUp, CheckCircle } from 'lucide-react';

export default function ProductDetailPage() {
    const checking = useSellerAuthGuard();

    const params = useParams();
    const router = useRouter();
    const productId = Number(params?.id);

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (checking) return;

        const token = useSellerAuthStore.getState().accessToken;
        if (!token) {
            router.push('/seller/login');
            return;
        }

        if (!productId) return;

        const fetchProduct = async () => {
            try {
                const data = await getProductDetail(productId);
                setProduct(data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('상품 정보를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, checking]);

    const handleDelete = async () => {
        if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return;

        try {
            await deleteProduct(productId);
            alert('삭제 완료');
            router.push('/seller/products');
        } catch (err) {
            console.error(err);
            alert('삭제 실패');
        }
    };

    const handleEdit = () => {
        router.push(`/seller/products/${productId}/edit`);
    };

    if (checking) return (
        <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">인증 확인 중...</p>
            </div>
        </div>
    );
    
    if (loading) return (
        <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">상품 정보를 불러오는 중...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">{error}</p>
            </div>
        </div>
    );
    
    if (!product) return (
        <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">상품 정보를 불러올 수 없습니다.</p>
            </div>
        </div>
    );

    return (
        <>
            <div className="hidden">
                <SellerHeader />
            </div>
            <SellerLayout>
                <div className="flex-1 w-full h-full px-4 py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
                    {/* 헤더와 액션 버튼 */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/seller/products')}
                                className="group flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-all duration-200 font-semibold bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-white/50 hover:shadow-md hover:bg-white/90"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                                상품 목록으로
                            </button>
                            <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent"></div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 to-indigo-700 bg-clip-text text-transparent">상품 상세</h1>
                        </div>
                        
                        {/* 액션 버튼들을 헤더 오른쪽으로 이동 */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleEdit}
                                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] transform"
                            >
                                <Edit className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                                상품 수정
                            </button>
                            <button
                                onClick={handleDelete}
                                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] transform"
                            >
                                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                상품 삭제
                            </button>
                        </div>
                    </div>

                    {/* 상품 기본 정보 카드 */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* 상품 이미지 */}
                            <div className="lg:w-1/3">
                                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden border border-white/50 shadow-inner group">
                                    {product.imageThumbnailUrl ? (
                                        <img
                                            src={product.imageThumbnailUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-20 h-20 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 상품 기본 정보 */}
                            <div className="lg:w-2/3 space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-indigo-700 bg-clip-text text-transparent leading-tight">{product.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                        <span className="text-slate-600 font-medium">프리미엄 상품</span>
                                    </div>
                                </div>
                                
                                {/* 상품 목록과 동일한 색상으로 변경 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 총 상품 수 색상 (slate) - 가격에 적용 */}
                                    <div className="group bg-gradient-to-r from-slate-50 to-white p-4 rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-r from-slate-500 to-gray-600 rounded-xl text-white">
                                                <DollarSign className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-700 font-medium">판매 가격</p>
                                                <p className="text-xl font-bold text-slate-800">{product.price.toLocaleString()}원</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 판매중 색상 (emerald) - 재고에 적용 */}
                                    <div className="group bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-2xl border border-emerald-200/50 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-emerald-700 font-medium">재고 수량</p>
                                                <p className="text-xl font-bold text-emerald-800">{product.stock}개</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 품절 색상 (red) - 품질에 적용 */}
                                    <div className="group bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-2xl border border-red-200/50 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white">
                                                <Tag className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-red-700 font-medium">상품 품질</p>
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                                                    product.status === '상' ? 'bg-green-100 text-green-700 border border-green-300' : 
                                                    product.status === '중' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 
                                                    'bg-red-100 text-red-700 border border-red-300'
                                                }`}>
                                                    {product.status}등급
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 판매중지 색상 (amber) - 상태에 적용 */}
                                    <div className="group bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/50 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white">
                                                <Eye className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-amber-700 font-medium">판매 상태</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${
                                                        product.isActive 
                                                            ? 'bg-green-100 text-green-700 border-green-300' 
                                                            : 'bg-red-100 text-red-700 border-red-300'
                                                    }`}>
                                                        {product.isActive ? (
                                                            <>
                                                                <CheckCircle className="w-3 h-3" />
                                                                판매중
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertCircle className="w-3 h-3" />
                                                                중단됨
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 상품 상세 정보 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 상품 정보 */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-indigo-700 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
                                    <Package className="w-6 h-6" />
                                </div>
                                상품 정보
                            </h3>
                            <div className="space-y-6">
                                <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-slate-200">
                                    <p className="text-sm font-semibold text-slate-600 mb-2">상품 설명</p>
                                    <p className="text-slate-800 leading-relaxed break-words">{product.description}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                                    <p className="text-sm font-semibold text-blue-700 mb-2">카테고리</p>
                                    <p className="text-blue-800 font-medium">{product.categoryName}</p>
                                </div>
                                {product.width && product.depth && product.height && (
                                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                                        <p className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                                            <Ruler className="w-4 h-4" />
                                            제품 크기 (가로 × 세로 × 높이)
                                        </p>
                                        <p className="text-purple-800 font-mono text-lg">{product.width} × {product.depth} × {product.height}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 판매자 정보 */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-indigo-700 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                판매자 정보
                            </h3>
                            <div className="space-y-6">
                                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                                    <p className="text-sm font-semibold text-emerald-700 mb-2">판매자명</p>
                                    <p className="text-emerald-800 font-bold text-lg">{product.sellerName}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                                    <p className="text-sm font-semibold text-amber-700 mb-2">판매자 ID</p>
                                    <p className="text-amber-800 font-mono">{product.sellerId}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-indigo-700 font-medium">신뢰할 수 있는 판매자</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SellerLayout>
        </>
    );
}
