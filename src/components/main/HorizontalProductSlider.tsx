'use client';

import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const mockProducts = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  image: `https://placehold.co/300x200?text=상품+${i + 1}&font=roboto`,
  name: `상품 ${i + 1}`,
}));

export default function HorizontalProductSlider() {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 7,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
    dots: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <div className="px-4 mt-12">
      <h2 className="text-lg font-bold mb-3">신규 추천 상품 💡</h2>
      <Slider {...settings}>
        {mockProducts.map((product) => (
          <div key={product.id} className="px-1">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover rounded-lg shadow-md"
            />
            <p className="text-sm mt-1 text-center">{product.name}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
}
