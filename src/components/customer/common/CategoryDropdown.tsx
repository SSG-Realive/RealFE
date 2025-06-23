'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface Category {
    id: number;
    name: string;
    parentId: number | null;
}

interface CategoryGroup {
    id: number;
    name: string;
    subCategories: Category[];
}

interface Props {
    onCategorySelect?: (id: number) => void;
}

export default function CategoryDropdown({ onCategorySelect }: Props) {
    const [categories, setCategories] = useState<CategoryGroup[]>([]);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [allHover, setAllHover] = useState(false);
    const [hoveredFirstId, setHoveredFirstId] = useState<number | null>(null);
    const [hoveredFirstIndex, setHoveredFirstIndex] = useState<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        axios
            .get<Category[]>('http://localhost:8080/api/seller/categories')
            .then((res) => {
                const all = res.data;
                const parents = all.filter((c) => c.parentId === null);
                const children = all.filter((c) => c.parentId !== null);

                const grouped: CategoryGroup[] = parents.map((p) => ({
                    id: p.id,
                    name: p.name,
                    subCategories: children.filter((c) => c.parentId === p.id),
                }));

                setCategories(grouped);
            })
            .catch((err) => {
                console.error('카테고리 불러오기 실패:', err);
            });
    }, []);

    const goToCategory = (id: number | null) => {
        if (onCategorySelect) onCategorySelect(id ?? -1);
        if (id === null) {
            location.href = '/main';
        } else {
            location.href = `/main?category=${id}`;
        }
    };

    const handleHoverIn = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setAllHover(true);
    };

    const handleHoverOut = () => {
        timeoutRef.current = setTimeout(() => {
            setAllHover(false);
            setHoveredFirstId(null);
            setHoveredFirstIndex(null);
        }, 200);
    };

    const handle1DepthEnter = (id: number | null) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setHoveredId(id);
    };

    const handle1DepthLeave = () => {
        timeoutRef.current = setTimeout(() => setHoveredId(null), 200);
    };

    return (
        <div className="flex gap-6 px-4 py-2 bg-white text-sm font-bold relative z-50">
            {/* ✅ ALL 항목: 2단 드롭다운 (분리선 제거 + 1차 기준 정렬) */}
            <div
                className="relative"
                onMouseEnter={handleHoverIn}
                onMouseLeave={handleHoverOut}
            >
                <span className="block px-2 py-1 cursor-pointer">ALL</span>

                {allHover && (
                    <div className="absolute top-full left-0 mt-1 bg-white shadow-md rounded z-50 min-w-[180px]">
                        {/* 1차 카테고리 목록 */}
                        <ul className="py-2">
                            {categories.map((group, idx) => (
                                <li
                                    key={group.id}
                                    onMouseEnter={() => {
                                        setHoveredFirstId(group.id);
                                        setHoveredFirstIndex(idx);
                                    }}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer relative"
                                >
                                    {group.name}

                                    {/* 해당 항목 hover 시 2차 카테고리 옆에 위치 */}
                                    {hoveredFirstId === group.id && group.subCategories.length > 0 && (
                                        <ul
                                            className="absolute top-0 left-full ml-2 bg-white shadow-md rounded z-50 min-w-[160px] py-2"
                                        >
                                            {group.subCategories.map((sub) => (
                                                <li
                                                    key={sub.id}
                                                    onClick={() => goToCategory(sub.id)}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                                                >
                                                    {sub.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* ✅ 기존 1차 → 2차 구조 유지 */}
            {categories.map((cat) => (
                <div
                    key={cat.id}
                    className="relative"
                    onMouseEnter={() => handle1DepthEnter(cat.id)}
                    onMouseLeave={handle1DepthLeave}
                >
          <span
              className="block px-2 py-1 cursor-pointer"
              onClick={() => goToCategory(cat.id)}
          >
            {cat.name}
          </span>

                    {hoveredId === cat.id && cat.subCategories.length > 0 && (
                        <div
                            className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded z-50 min-w-[160px]"
                            onMouseEnter={() => handle1DepthEnter(cat.id)}
                            onMouseLeave={handle1DepthLeave}
                        >
                            <ul className="py-2">
                                {cat.subCategories.map((sub) => (
                                    <li
                                        key={sub.id}
                                        onClick={() => goToCategory(sub.id)}
                                        className="px-4 py-2 hover:bg-gray-100 whitespace-nowrap cursor-pointer"
                                    >
                                        {sub.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
