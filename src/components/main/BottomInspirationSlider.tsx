'use client';

const inspirationImages = [
    '/images/banner9.jpg',
    '/images/banner10.jpg',
    '/images/banner11.jpg',
    '/images/banner12.jpg',
    '/images/banner13.jpg',
    '/images/banner14.jpg',
    '/images/banner15.jpg',
];

export default function BottomInspirationSlider() {
    return (
        <div className="w-full bg-white py-10">
            <div className="overflow-x-auto custom-scrollbar">
                <div className="flex w-max space-x-4 px-4">
                    {inspirationImages.map((src, idx) => (
                        <div
                            key={idx}
                            className="
                min-w-[140px]
                sm:min-w-[180px]
                md:min-w-[220px]
                lg:min-w-[260px]
                rounded-lg
                overflow-hidden
                shadow-md
              "
                        >
                            <img
                                src={src}
                                alt={`인테리어 ${idx + 1}`}
                                className="w-full h-40 sm:h-44 md:h-48 object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
