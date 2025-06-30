'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { fetchPublicProducts } from '@/service/customer/productService';
import { fetchAllCategories } from '@/service/categoryService';

import { ProductListDTO } from '@/types/seller/product/product';
import { Category } from '@/types/common/category';

import ChatbotFloatingButton from '@/components/customer/common/ChatbotFloatingButton';
import ProductCard from '@/components/customer/product/ProductCard';
import BannerCarousel from '@/components/main/BannerCarousel';
import WeeklyAuctionSlider from '@/components/main/WeeklyAuctionSlider';
import PopularProductsGrid from '@/components/main/PopularProductsGrid';
import MiddleBannerCarousel from '@/components/main/MiddleBannerCarousel';
import ExtraBanner from '@/components/main/ExtraBanner';
import SectionWithSubCategoryButtons from '@/components/customer/product/SectionWithSubCategoryButtons';
import FeaturedSellersSection from '@/components/main/FeaturedSellersSection';
import BottomInspirationSlider from '@/components/main/BottomInspirationSlider';
import ScrollToTopButton from '@/components/customer/common/ScrollToTopButton';
import Footer from '@/components/customer/common/Footer';

const ITEMS_PER_PAGE = 10;

export default function CustomerHomePage() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const categoryFromUrl = searchParams.get('category');
    const keywordFromUrl = searchParams.get('keyword') || '';
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [keyword, setKeyword] = useState<string>('');
    const [products, setProducts] = useState<ProductListDTO[]>([]);
    const [page, setPage] = useState(1);
    const [showLoadMore, setShowLoadMore] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryMap, setCategoryMap] = useState<Record<number, Category>>({});

    const isMainDefaultView = pathname === '/main' && !categoryFromUrl && !keywordFromUrl;

    useEffect(() => {
        fetchAllCategories().then((data) => {
            setCategories(data);
            setCategoryMap(Object.fromEntries(data.map((c) => [c.id, c])));
        });
    }, []);

    useEffect(() => {
        setCategoryId(categoryFromUrl ? Number(categoryFromUrl) : null);
        setKeyword(keywordFromUrl);
        setPage(1);
    }, [categoryFromUrl, keywordFromUrl]);

    useEffect(() => {
        fetchPublicProducts(categoryId, 1, ITEMS_PER_PAGE, keyword).then((initial) => {
            setProducts(initial);
            setShowLoadMore(initial.length === ITEMS_PER_PAGE);
        });
    }, [categoryId, keyword]);

    const loadMore = async () => {
        const nextPage = page + 1;
        const newProducts = await fetchPublicProducts(categoryId, nextPage, ITEMS_PER_PAGE, keyword);
        setProducts((prev) => [...prev, ...newProducts]);
        setPage(nextPage);
        setShowLoadMore(newProducts.length === ITEMS_PER_PAGE);
    };

    const getCategoryTitle = () => {
        if (!categoryId || !categoryMap[categoryId]) return '전체상품';
        let current = categoryMap[categoryId];
        while (current.parentId && categoryMap[current.parentId]) {
            current = categoryMap[current.parentId];
        }
        return current.name;
    };

    const getSiblingCategories = (): Category[] => {
        if (!categoryId || !categoryMap[categoryId]) return categories.filter((c) => c.parentId === null);
        const current = categoryMap[categoryId];
        const parentId = current.parentId ?? current.id;
        return categories.filter((c) => c.parentId === parentId);
    };

    return (
        <div className="flex flex-col min-h-screen relative overflow-x-visible">
            <main className="flex-1">
                {isMainDefaultView && <div className="mb-6 sm:mb-8"><BannerCarousel /></div>}
                {!categoryId && <div className="mt-2 mb-4 sm:mt-10 sm:mb-8"><WeeklyAuctionSlider /></div>}
                <PopularProductsGrid />
                {isMainDefaultView && <ExtraBanner />}
                {isMainDefaultView && <div className="my-4 sm:my-8 md:my-12"><FeaturedSellersSection /></div>}
                {isMainDefaultView && <MiddleBannerCarousel />}

                {/* ✅ 제목 + 카테고리 필터 */}
                <section className="max-w-screen-xl mx-auto px-2 sm:px-4 mt-4 mb-2">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{getCategoryTitle()}</h2>
                    <div className="overflow-x-auto no-scrollbar whitespace-nowrap -mx-2 px-2">
                        {isMainDefaultView && (
                            <button
                                onClick={() => {
                                    setCategoryId(null);
                                    setKeyword('');
                                    setPage(1);
                                }}
                                className={`shrink-0 inline-block text-sm px-3 py-1 mr-2 rounded-full whitespace-nowrap ${categoryId === null ? 'bg-black text-white' : 'bg-white text-gray-600'}`}
                            >
                                전체
                            </button>
                        )}
                        {getSiblingCategories().map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setCategoryId(cat.id);
                                    setKeyword('');
                                    setPage(1);
                                }}
                                className={`shrink-0 inline-block text-sm px-3 py-1 mr-2 rounded-full whitespace-nowrap ${categoryId === cat.id ? 'bg-black text-white' : 'bg-white text-gray-600'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ✅ 상품 리스트 */}
                <section className="max-w-screen-xl mx-auto px-1 py-4 sm:py-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 px-2 sm:px-0">
                        {products.map((p, index) => (
                            <ProductCard key={`product-${p.id}-${index}`} {...p} />
                        ))}
                    </div>
                    {showLoadMore && (
                        <div className="text-center mt-6">
                            <button
                                onClick={loadMore}
                                className="px-6 py-2 text-sm bg-white hover:bg-gray-100 text-gray-800 rounded-lg border border-gray-300"
                            >
                                더보기
                            </button>
                        </div>
                    )}
                </section>

                {isMainDefaultView && <BottomInspirationSlider />}
                {isMainDefaultView && (
                    <>
                        {(() => {
                            const titleMap: Record<number, string> = {
                                10: '거실 가구',
                                20: '침실 가구',
                                30: '주방·다이닝 가구',
                                40: '서재·오피스 가구',
                                50: '기타 가구',
                            };
                            return [10, 20, 30, 40, 50].map((id) => (
                                <div key={id} className="mb-6 sm:mb-10">
                                    <SectionWithSubCategoryButtons title={titleMap[id] ?? '기타'} categoryId={id} limit={5} />
                                </div>
                            ));
                        })()}
                    </>
                )}
            </main>

            <Footer />

            <ChatbotFloatingButton />
            <ScrollToTopButton />
        </div>
    );
}
