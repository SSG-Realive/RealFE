'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SellerHeader from '@/components/seller/SellerHeader';
import { getProductDetail, updateProduct, fetchCategories } from '@/service/seller/productService';
import { SellerCategoryDTO } from '@/types/seller/category/sellerCategory';
import { ProductDetail } from '@/types/seller/product/product';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import SellerLayout from '@/components/layouts/SellerLayout';
import { ArrowLeft, Package, Tag, DollarSign, Layers, Ruler, Image, Video, Save, AlertCircle, Sparkles, ShoppingBag, Settings, CheckCircle2 } from 'lucide-react';

export default function ProductEditPage() {
    const checking = useSellerAuthGuard();
    const router = useRouter();
    const params = useParams();
    const productId = params?.id as string;

    const [form, setForm] = useState<ProductDetail | null>(null);
    const [categories, setCategories] = useState<SellerCategoryDTO[]>([]);
    const [parentCategoryIdState, setParentCategoryIdState] = useState<number | ''>(''); // ✅ UI 용 parentCategoryId
    const [imageThumbnail, setImageThumbnail] = useState<File | null>(null);
    const [videoThumbnail, setVideoThumbnail] = useState<File | null>(null);
    const [subImages, setSubImages] = useState<FileList | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (checking) return;
        if (!productId) return;

        const fetchData = async () => {
            try {
                const [productData, categoryData] = await Promise.all([
                    getProductDetail(Number(productId)),
                    fetchCategories()
                ]);

                // parentCategoryId 계산
                const selectedCategory = categoryData.find(cat => cat.id === productData.categoryId);
                const parentId = selectedCategory?.parentId ?? '';

                // form 세팅
                setForm({
                    ...productData,
                });

                // parentCategoryId state 에만 유지
                setParentCategoryIdState(parentId);

                setCategories(categoryData);
                setError(null);
            } catch (err) {
                console.error('상품/카테고리 불러오기 실패', err);
                setError('상품 또는 카테고리 정보를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId, checking]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!form) return;
        const { name, value } = e.target;
        if (name === 'stock') {
            const newStock = Number(value);
            console.log('=== 재고 변경 ===');
            console.log('이전 재고:', form.stock);
            console.log('새 재고:', newStock);
            console.log('현재 isActive:', form.isActive);

            setForm({
                ...form,
                stock: newStock,
                // 재고가 0이 되더라도 isActive를 강제로 변경하지 않음
                // 사용자가 체크박스로 직접 제어하도록 함
            });
            
            // 재고가 0이면서 활성화된 상품에 대한 경고
            if (newStock === 0 && form.isActive) {
                console.log('경고: 재고가 0이지만 상품이 활성화되어 있습니다.');
            }
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!form) return;

        // 카테고리 필수 체크
        if (!form.categoryId || form.categoryId === 0) {
            alert('카테고리를 선택해주세요.');
            return;
        }

        console.log('=== 상품 수정 시작 ===');
        console.log('수정할 상품 ID:', productId);
        console.log('폼 데이터:', form);

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('price', String(form.price));
        formData.append('stock', String(form.stock || 1));
        formData.append('width', String(form.width || 0));
        formData.append('depth', String(form.depth || 0));
        formData.append('height', String(form.height || 0));
        formData.append('status', form.status);
        formData.append('active', String(form.isActive));
        formData.append('categoryId', String(form.categoryId)); // ✅ categoryId 만 서버 전송

        // 이미지
        if (imageThumbnail) {
            console.log('대표 이미지 추가:', imageThumbnail.name);
            formData.append('imageThumbnail', imageThumbnail);
        }
        if (videoThumbnail) {
            console.log('대표 영상 추가:', videoThumbnail.name);
            formData.append('videoThumbnail', videoThumbnail);
        }
        if (subImages) {
            console.log('서브 이미지 개수:', subImages.length);
            Array.from(subImages).forEach((file, index) => {
                console.log(`서브 이미지 ${index + 1}:`, file.name);
                formData.append('subImages', file);
            });
        }

        // FormData 내용 로깅
        console.log('=== FormData 내용 ===');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: [파일] ${value.name} (${value.size} bytes)`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }

        try {
            console.log('API 호출 시작...');
            await updateProduct(Number(productId), formData);
            console.log('상품 수정 성공!');
            alert('상품이 수정되었습니다.');
            router.push('/seller/products');
        } catch (err: any) {
            console.error('=== 상품 수정 실패 ===');
            console.error('에러 객체:', err);
            console.error('에러 메시지:', err.message);
            console.error('응답 상태:', err.response?.status);
            console.error('응답 데이터:', err.response?.data);
            console.error('응답 헤더:', err.response?.headers);
            
            let errorMessage = '상품 수정 중 오류가 발생했습니다.';
            
            if (err.response?.status === 400) {
                errorMessage = '입력 데이터가 올바르지 않습니다. 필수 항목을 확인해주세요.';
            } else if (err.response?.status === 401) {
                errorMessage = '로그인이 필요합니다.';
            } else if (err.response?.status === 403) {
                errorMessage = '해당 상품을 수정할 권한이 없습니다.';
            } else if (err.response?.status === 404) {
                errorMessage = '상품을 찾을 수 없습니다.';
            } else if (err.response?.status >= 500) {
                errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
            alert(`수정 실패: ${errorMessage}`);
        }
    };

    const handleParentCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const parentId = e.target.value ? Number(e.target.value) : '';
        setParentCategoryIdState(parentId); // ✅ select box state 유지
        setForm(form ? { ...form, categoryId: 0 } : null); // ✅ subCategory 초기화
    };

    const handleSubCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const subCategoryId = e.target.value ? Number(e.target.value) : 0;
        setForm(form ? { ...form, categoryId: subCategoryId } : null);
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
    
    if (!form) return (
        <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">상품 정보를 불러올 수 없습니다.</p>
            </div>
        </div>
    );

    const parentCategories = categories.filter(cat => cat.parentId === null);
    const subCategories = categories.filter(cat => cat.parentId === Number(parentCategoryIdState));

    return (
        <>
            <div className="hidden">
                <SellerHeader />
            </div>
            <SellerLayout>
                <div className="flex-1 w-full h-full px-4 py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
                    {/* 헤더 */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => router.push(`/seller/products/${productId}`)}
                            className="group flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-all duration-200 font-semibold bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-white/50 hover:shadow-md hover:bg-white/90"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                            상품 상세로
                        </button>
                        <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent"></div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-indigo-600" />
                            상품 수정
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
                        {/* 기본 정보 섹션 */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-indigo-700 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
                                    <Package className="w-6 h-6" />
                                </div>
                                기본 정보
                            </h3>
                            
                            {/* 카테고리 선택 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        카테고리 (1차)
                                    </label>
                                    <select
                                        value={parentCategoryIdState}
                                        onChange={handleParentCategoryChange}
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium"
                                        required
                                    >
                                        <option value="">-- 카테고리 선택 --</option>
                                        {parentCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        카테고리 (2차)
                                    </label>
                                    <select
                                        value={form.categoryId || ''}
                                        onChange={handleSubCategoryChange}
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium"
                                        required
                                    >
                                        <option value="">-- 세부 카테고리 선택 --</option>
                                        {subCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* 상품명 */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    상품명
                                </label>
                                <input 
                                    name="name" 
                                    value={form.name} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium"
                                    placeholder="상품명을 입력하세요"
                                />
                            </div>

                            {/* 상품 설명 */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    상품 설명
                                </label>
                                <textarea 
                                    name="description" 
                                    value={form.description} 
                                    onChange={handleChange} 
                                    required 
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none font-medium"
                                    placeholder="상품에 대한 자세한 설명을 입력하세요"
                                />
                            </div>
                        </div>

                        {/* 가격 및 재고 섹션 */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                가격 및 재고
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        판매 가격 (원)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        value={form.price} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 font-medium"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        재고 수량 (개)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="stock" 
                                        value={form.stock} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 font-medium"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 상품 상태 섹션 */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white">
                                    <Settings className="w-6 h-6" />
                                </div>
                                상품 상태 설정
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        상품 품질 등급
                                    </label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 font-medium"
                                        required
                                    >
                                        <option value="상">상급 (최고 품질)</option>
                                        <option value="중">중급 (양호한 품질)</option>
                                        <option value="하">하급 (기본 품질)</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-center">
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200 w-full">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="active"
                                                checked={form.isActive}
                                                onChange={(e) => {
                                                    console.log('=== isActive 체크박스 변경 ===');
                                                    console.log('현재 재고:', form.stock);
                                                    console.log('현재 isActive:', form.isActive);
                                                    console.log('변경하려는 값:', e.target.checked);
                                                    
                                                    // 재고가 0인 상태에서 활성화하려고 할 때만 경고
                                                    if (form.stock === 0 && e.target.checked) {
                                                        alert('재고가 0인 상태에서는 상품을 활성화할 수 없습니다.\n재고를 먼저 추가해주세요.');
                                                        console.log('재고 0으로 인한 활성화 차단');
                                                        return;  // 체크 방지
                                                    }
                                                    
                                                    console.log('isActive 변경 적용:', e.target.checked);
                                                    setForm({ ...form, isActive: e.target.checked });
                                                }}
                                                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-purple-300 rounded"
                                            />
                                            <div>
                                                <label htmlFor="active" className="block text-sm font-semibold text-purple-700">
                                                    판매 활성화
                                                </label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                                                        form.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {form.isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                        {form.isActive ? '판매중' : '판매중지'}
                                                    </span>
                                                    {form.stock === 0 && (
                                                        <span className="text-xs text-red-500 font-medium">
                                                            ⚠️ 재고 부족
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 크기 정보 섹션 */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white">
                                    <Ruler className="w-6 h-6" />
                                </div>
                                제품 크기 정보
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        가로 (Width)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="width" 
                                        value={form.width} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 font-medium"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        세로 (Depth)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="depth" 
                                        value={form.depth} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 font-medium"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        높이 (Height)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="height" 
                                        value={form.height} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 font-medium"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 미디어 섹션 */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
                                    <Image className="w-6 h-6" />
                                </div>
                                미디어 파일
                            </h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        대표 이미지
                                    </label>
                                    {form?.imageThumbnailUrl && (
                                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm text-blue-700 font-medium">
                                                현재 파일: {form.imageThumbnailUrl.split('/').pop()}
                                            </p>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setImageThumbnail(e.target.files?.[0] || null)} 
                                        required={form?.imageThumbnailUrl ? false : true} 
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <Video className="w-4 h-4" />
                                        대표 영상 (선택사항)
                                    </label>
                                    <input
                                        type="file" 
                                        accept="video/*" 
                                        onChange={(e) => setVideoThumbnail(e.target.files?.[0] || null)} 
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        추가 이미지 (선택사항)
                                    </label>
                                    <input
                                        type="file" 
                                        accept="image/*" 
                                        multiple 
                                        onChange={(e) => setSubImages(e.target.files)} 
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 에러 메시지 */}
                        {error && (
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-6 h-6 text-red-500" />
                                    <p className="text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* 제출 버튼 */}
                        <div className="flex justify-end pt-4">
                            <button 
                                type="submit" 
                                className="group flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] transform"
                            >
                                <Save className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                                상품 수정 완료
                            </button>
                        </div>
                    </form>
                </div>
            </SellerLayout>
        </>
    );
}
