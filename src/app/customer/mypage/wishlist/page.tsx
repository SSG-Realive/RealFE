'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWishlist, toggleWishlist } from '@/service/customer/wishlistService';
import { ProductListDTO } from '@/types/seller/product/product';
import Navbar from '@/components/customer/common/Navbar';

export default function WishlistPage() {
    const [products, setProducts] = useState<ProductListDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchWishlist()
            .then(setProducts)
            .catch(() => alert('찜 목록을 불러오는데 실패했습니다.'))
            .finally(() => setLoading(false));
    }, []);

    const toggleEditMode = () => {
        setIsEditMode((prev) => !prev);
        setSelectedIds(new Set());
    };

    const handleSelectProduct = (productId: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(productId) ? next.delete(productId) : next.add(productId);
            return next;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? new Set(filteredProducts.map((p) => p.id)) : new Set());
    };

    const handleDeleteOne = async (e: React.MouseEvent, productId: number) => {
        e.stopPropagation();
        if (!confirm('이 상품을 찜 목록에서 삭제하시겠습니까?')) return;
        try {
            await toggleWishlist({ productId });
            setProducts((prev) => prev.filter((p) => p.id !== productId));
            alert('찜 목록에서 제거되었습니다.');
        } catch {
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return alert('삭제할 상품을 선택해주세요.');
        if (!confirm(`${selectedIds.size}개의 상품을 삭제하시겠습니까?`)) return;
        try {
            await Promise.all(Array.from(selectedIds).map((id) => toggleWishlist({ productId: id })));
            setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
            alert(`${selectedIds.size}개의 상품이 삭제되었습니다.`);
            toggleEditMode();
        } catch {
            alert('선택 삭제 중 오류가 발생했습니다.');
        }
    };

    // ✅ 부모 카테고리 필터 처리
    const parentCategories = Array.from(
        new Set(products.map((p) => p.parentCategoryName).filter(Boolean))
    ) as string[];

    const filteredProducts = selectedParentCategory
        ? products.filter((p) => p.parentCategoryName === selectedParentCategory)
        : products;

    if (loading) return <div>로딩 중...</div>;

    return (
        <>
            <Navbar />
            <div className="bg-gray-100 min-h-screen py-8">
                <main className="max-w-xl lg:max-w-4xl mx-auto px-4 space-y-6">
                    {/* 상단 제목/버튼 박스 + 필터 추가 */}
                    <section className="bg-white rounded-lg shadow p-4">
                        <h1 className="text-xl font-bold text-slate-600 mb-2">찜한 상품</h1>
                        {products.length > 0 && (
                            <>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-sm text-gray-500 ml-1">{filteredProducts.length}개</span>
                                    <button onClick={toggleEditMode} className="text-sm text-gray-600">
                                        {isEditMode ? '편집 취소' : '상품 편집'}
                                    </button>
                                </div>

                                {/* ✅ 1차 카테고리 필터 버튼 */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button
                                        onClick={() => setSelectedParentCategory(null)}
                                        className={`px-3 py-1 rounded-full border ${
                                            selectedParentCategory === null
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white text-gray-600'
                                        }`}
                                    >
                                        전체
                                    </button>
                                    {parentCategories.map((name) => (
                                        <button
                                            key={name}
                                            onClick={() => setSelectedParentCategory(name)}
                                            className={`px-3 py-1 rounded-full border ${
                                                selectedParentCategory === name
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-gray-600'
                                            }`}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>

                    {/* 상품 목록 박스 */}
                    <section className="bg-white rounded-lg shadow p-4">
                        {isEditMode && filteredProducts.length > 0 && (
                            <div className="flex items-center mb-4 pb-2 border-b">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5"
                                    onChange={handleSelectAll}
                                    checked={
                                        selectedIds.size > 0 &&
                                        selectedIds.size === filteredProducts.length
                                    }
                                />
                                <label className="ml-2 text-sm">
                                    전체선택 ({selectedIds.size}/{filteredProducts.length})
                                </label>
                            </div>
                        )}

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">찜한 상품이 없습니다.</div>
                        ) : (
                            <ul className="space-y-6">
                                {filteredProducts.map((p) => (
                                    <li
                                        key={p.id}
                                        className="flex items-center bg-gray-50 rounded-lg shadow-sm p-4 relative"
                                    >
                                        {isEditMode && (
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 mr-4 flex-shrink-0"
                                                checked={selectedIds.has(p.id)}
                                                onChange={() => handleSelectProduct(p.id)}
                                            />
                                        )}
                                        <Link
                                            href={`/main/products/${p.id}`}
                                            className="flex items-center flex-grow"
                                        >
                                            <img
                                                src={p.imageThumbnailUrl}
                                                alt={p.name}
                                                className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                                            />
                                            <div className="flex-grow ml-4">
                                                <p className="text-sm text-gray-500">{p.sellerName}</p>
                                                <h3 className="font-medium hover:underline leading-tight">{p.name}</h3>
                                                <p className="font-bold mt-1">{p.price.toLocaleString()}원</p>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={(e) => handleDeleteOne(e, p.id)}
                                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                                        >
                                            &times;
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </main>
            </div>


            {isEditMode && (
                <footer className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
                    <div className="max-w-xl lg:max-w-4xl mx-auto p-4">
                        <button
                            onClick={handleDeleteSelected}
                            disabled={selectedIds.size === 0}
                            className="w-full py-3 bg-red-500 text-white font-bold rounded-md disabled:bg-gray-300"
                        >
                            선택 삭제 ({selectedIds.size})
                        </button>
                    </div>
                </footer>
            )}
        </>
    );
}
