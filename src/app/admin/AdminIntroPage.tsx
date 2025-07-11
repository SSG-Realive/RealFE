"use client";
import { useRouter } from 'next/navigation';

export default function AdminIntroPage() {
  const router = useRouter();

  const handleLoginClick = () => {
    if (typeof window !== "undefined" && localStorage.getItem("adminToken")) {
      router.push("/admin/dashboard");
    } else {
      router.push("/admin/login");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-white items-center justify-center">
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 style={{ fontSize: 40, fontWeight: 'bold', marginBottom: 32, color: '#222' }}>관리자 페이지</h1>
        <p style={{ fontSize: 18, color: '#555', marginBottom: 40 }}>Realive 서비스 관리자 전용 페이지</p>
        <button
          onClick={handleLoginClick}
          style={{
            fontSize: 22,
            padding: '18px 60px',
            background: '#222',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px #bbb',
            letterSpacing: 2
          }}
        >
          관리자 로그인
        </button>
      </main>
    </div>
  );
}