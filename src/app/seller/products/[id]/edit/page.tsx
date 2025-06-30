'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SellerHeader from '@/components/seller/SellerHeader';
import { getProductDetail, updateProduct, fetchCategories } from '@/service/seller/productService';
import { SellerCategoryDTO } from '@/types/seller/category/sellerCategory';
import { ProductDetail } from '@/types/seller/product/product';
import useSellerAuthGuard from '@/hooks/useSellerAuthGuard';
import SellerLayout from '@/components/layouts/SellerLayout';
import { ArrowLeft, Package, Tag, DollarSign, Layers, Ruler, Image, Video, Save, AlertCircle } from 'lucide-react';

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

            setForm({
                ...form,
                stock: newStock,
                isActive: newStock === 0 ? false : form.isActive,  // 🚩 재고가 0이면 isActive false 강제 설정
            });
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
        <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-white flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6b7280] mx-auto mb-4"></div>
                <p className="text-[#374151]">인증 확인 중...</p>
            </div>
        </div>
    );
    
    if (loading) return (
        <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-white flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6b7280] mx-auto mb-4"></div>
                <p className="text-[#374151]">상품 정보를 불러오는 중...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-white flex items-center justify-center">
            <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
            </div>
        </div>
    );
    
    if (!form) return (
        <div className="w-full max-w-full min-h-screen overflow-x-hidden bg-white flex items-center justify-center">
            <div className="text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-[#374151]">상품 정보를 불러올 수 없습니다.</p>
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
                <div className="flex-1 w-full h-full px-4 py-8">
                    {/* 헤더 */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => router.push(`/seller/products/${productId}`)}
                            className="flex items-center gap-2 text-[#6b7280] hover:text-[#374151] transition-colors font-bold"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            상품 상세로
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-[#374151]">상품 수정</h1>
                    </div>

                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                        {/* 기본 정보 섹션 */}
                        <div className="bg-[#f3f4f6] rounded-xl shadow border border-[#d1d5db] p-8">
                            <h3 className="text-lg font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-[#6b7280]" />
                                기본 정보
                            </h3>
                            
                            {/* 카테고리 선택 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        카테고리 (1차)
                                    </label>
                                    <select
                                        value={parentCategoryIdState}
                                        onChange={handleParentCategoryChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280]"
                                        required
                                    >
                                        <option value="">-- 선택 --</option>
                                        {parentCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        카테고리 (2차)
                                    </label>
                                    <select
                                        value={form.categoryId || ''}
                                        onChange={handleSubCategoryChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280]"
                                        required
                                    >
                                        <option value="">-- 선택 --</option>
                                        {subCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* 상품명 */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    상품명
                                </label>
                                <input 
                                    name="name" 
                                    value={form.name} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280]"
                                    placeholder="상품명을 입력하세요"
                                />
                            </div>

                            {/* 상품 설명 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    상품 설명
                                </label>
                                <textarea 
                                    name="description" 
                                    value={form.description} 
                                    onChange={handleChange} 
                                    required 
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280] resize-none"
                                    placeholder="상품 설명을 입력하세요"
                                />
                            </div>
                        </div>

                        {/* 가격 및 재고 섹션 */}
                        <div className="bg-[#f3f4f6] rounded-xl shadow border border-[#d1d5db] p-8">
                            <h3 className="text-lg font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-[#6b7280]" />
                                가격 및 재고
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        가격
                                    </label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        value={form.price} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280]"
                                        placeholder="가격을 입력하세요"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        재고
                                    </label>
                                    <input 
                                        type="number" 
                                        name="stock" 
                                        value={form.stock} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280]"
                                        placeholder="재고 수량을 입력하세요"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 상품 상태 섹션 */}
                        <div className="bg-[#f3f4f6] rounded-xl shadow border border-[#d1d5db] p-8">
                            <h3 className="text-lg font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-[#6b7280]" />
                                상품 상태
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        상품 상태
                                    </label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280]"
                                        required
                                    >
                                        <option value="상">상</option>
                                        <option value="중">중</option>
                                        <option value="하">하</option>
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={form.isActive}
                                        disabled={form.stock === 0}  // 재고가 0이면 체크박스 비활성화
                                        onChange={(e) => {
                                            if (form.stock === 0 && e.target.checked) {
                                                alert('재고가 0인 상태에서는 상품을 활성화할 수 없습니다.');
                                                return;  // 체크 방지
                                            }
                                            setForm({ ...form, isActive: e.target.checked });
                                        }}
                                        className="h-4 w-4 text-[#6b7280] focus:ring-[#6b7280] border-gray-300 rounded"
                                    />
                                    <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                                        활성화 여부
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* 크기 정보 섹션 */}
                        <div className="bg-[#f3f4f6] rounded-xl shadow border border-[#d1d5db] p-8">
                            <h3 className="text-lg font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                <Ruler className="w-5 h-5 text-[#6b7280]" />
                                크기 정보
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        가로 (Width)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="width" 
                                        value={form.width} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280]"
                                        placeholder="가로"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        세로 (Depth)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="depth" 
                                        value={form.depth} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280]"
                                        placeholder="세로"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        높이 (Height)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="height" 
                                        value={form.height} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280]"
                                        placeholder="높이"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 미디어 섹션 */}
                        <div className="bg-[#f3f4f6] rounded-xl shadow border border-[#d1d5db] p-8">
                            <h3 className="text-lg font-semibold text-[#374151] mb-4 flex items-center gap-2">
                                <Image className="w-5 h-5 text-[#6b7280]" />
                                미디어
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        대표 이미지
                                    </label>
                                    {form?.imageThumbnailUrl && (
                                        <div className="mb-2 text-sm text-gray-600">
                                            현재 등록된 파일명: {form.imageThumbnailUrl.split('/').pop()}
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setImageThumbnail(e.target.files?.[0] || null)} 
                                        required={form?.imageThumbnailUrl ? false : true} 
                                        className="w-full px-3 py-2 border border-[#d1d5db] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280] bg-[#f3f4f6] text-[#374151] file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#d1d5db] file:text-[#374151] hover:file:bg-[#e5e7eb]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <Video className="w-4 h-4" />
                                        대표 영상
                                    </label>
                                    <input
                                        type="file" 
                                        accept="video/*" 
                                        onChange={(e) => setVideoThumbnail(e.target.files?.[0] || null)} 
                                        className="w-full px-3 py-2 border border-[#d1d5db] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280] bg-[#f3f4f6] text-[#374151] file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#d1d5db] file:text-[#374151] hover:file:bg-[#e5e7eb]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        서브 이미지
                                    </label>
                                    <input
                                        type="file" 
                                        accept="image/*" 
                                        multiple 
                                        onChange={(e) => setSubImages(e.target.files)} 
                                        className="w-full px-3 py-2 border border-[#d1d5db] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:border-[#6b7280] bg-[#f3f4f6] text-[#374151] file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#d1d5db] file:text-[#374151] hover:file:bg-[#e5e7eb]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 에러 메시지 */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* 제출 버튼 */}
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                className="flex items-center gap-2 bg-[#d1d5db] hover:bg-[#6b7280] text-[#374151] hover:text-white py-3 px-6 rounded-lg font-medium transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                상품 수정
                            </button>
                        </div>
                    </form>
                </div>
            </SellerLayout>
        </>
    );
}
