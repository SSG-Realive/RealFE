'use client'

import { useEffect, useRef, useState } from 'react'
import { fetchPopularProducts } from '@/service/customer/productService'
import { ProductListDTO } from '@/types/seller/product/product'
import ProductCard from '@/components/customer/product/ProductCard'
import Slider from 'react-slick'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

export default function PopularProductsGrid() {
    const [products, setProducts] = useState<ProductListDTO[] | null>(null)
    const sliderRef = useRef<Slider | null>(null)

    const settings = {
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: false,
        swipeToSlide: true,
        draggable: true,
        pauseOnHover: false,
        pauseOnFocus: false,
        responsive: [
            {
                breakpoint: 1280,
                settings: { slidesToShow: 4, slidesToScroll: 1 },
            },
            {
                breakpoint: 1024,
                settings: { slidesToShow: 3, slidesToScroll: 1 },
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: 2, slidesToScroll: 1 },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    swipeToSlide: true,
                    draggable: true,
                },
            },
        ],
    }

    useEffect(() => {
        fetchPopularProducts()
            .then((data) => {
                setProducts(data.slice(0, 15)) // 최대 15개
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'))
                    sliderRef.current?.slickGoTo(0, true)
                }, 50)
            })
            .catch((err) => {
                console.error('인기 상품 불러오기 실패:', err)
            })
    }, [])

    return (
        <section className="max-w-screen-xl mx-auto mt-6 sm:mt-10 px-4">
        <h2 className="text-xl font-light text-gray-800 mb-6">인기 상품</h2>

            {/* 로딩 완료 후에만 슬라이더 렌더링 */}
            {products && (
                <Slider {...settings} ref={sliderRef}>
                    {products.map((product) => (
                        <div key={product.id} className="px-2">
                            <ProductCard {...product} />
                        </div>
                    ))}
                </Slider>
            )}
        </section>
    )
}
