'use client';

import { use } from 'react';

interface SellerPageProps {
  params: Promise<{ id: string }>;
}

export default function SellerPage({ params }: SellerPageProps) {
  const { id } = use(params);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">판매자 페이지</h1>
      <p className="mt-2 text-gray-600">판매자 ID: {id}</p>
    </div>
  );
}

