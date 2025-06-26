'use client';

import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function ExtraBannerCarousel() {
    const bannerImages = [
        '/images/banner6.jpg',
        '/images/banner7.jpg',
        '/images/banner8.jpg',
    ];

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640); // tailwind 기준 sm: 640px
        };

        handleResize(); // 초기 실행
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sliderSettings = {
        dots: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 4000,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
    };

    return (
        <div className="w-full px-4 my-10">
            <div className="max-w-screen-xl mx-auto">
                {isMobile ? (
                    <Slider {...sliderSettings}>
                        {bannerImages.map((src, idx) => (
                            <div key={idx} className="px-2">
                                <img
                                    src={src}
                                    alt={`배너 ${idx + 1}`}
                                    className="w-full h-auto object-contain rounded-lg shadow-md"
                                />
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bannerImages.map((src, idx) => (
                            <div key={idx} className="w-full overflow-hidden shadow-sm rounded-lg bg-white">
                                <img
                                    src={src}
                                    alt={`배너 ${idx + 1}`}
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
