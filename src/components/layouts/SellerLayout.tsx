// components/layouts/SellerLayout.tsx
import { ReactNode } from "react";
import SellerSidebar from "../seller/SellerSidebar";

interface SellerLayoutProps {
  children: ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <div className="flex">
      {/* 왼쪽에 사이드바 */}
      <SellerSidebar />

      {/* 오른쪽 메인 콘텐츠 */}
      <main className="flex-1 bg-gray-100 min-h-screen p-6">
        {children}
      </main>
    </div>
  );
}
