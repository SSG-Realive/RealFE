import { fetchFeaturedSellersWithProducts } from "@/service/customer/productService";
import { FeaturedSellerWithProducts } from "@/types/product";
import { useEffect, useState } from "react";

export default function FeaturedSellersSection() {
  const [featured, setFeatured] = useState<FeaturedSellerWithProducts[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedSellersWithProducts()
      .then(data => {
        setFeatured(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('추천 섹션 로드 실패', err);
        setError(err.message ?? '알 수 없는 에러');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">추천 섹션을 불러올 수 없습니다: {error}</div>;
  }

  return (
    <section className="my-8">
      <h2 className="text-2xl font-semibold mb-4">오늘의 추천 판매자 상품</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map(seller => (
          <div
            key={seller.sellerId}
            className="border rounded-2xl p-4 shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-lg font-medium mb-3">{seller.sellerName}</h3>
            <ul className="space-y-3">
              {seller.products.map(product => (
                <li key={product.productId} className="flex items-center space-x-3">
                  <img
                    src={product.imageThumbnailUrl}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-semibold truncate max-w-xs">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      ₩{product.price.toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}