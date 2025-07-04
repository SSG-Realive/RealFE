'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';

export default function ChatBotWidget() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [token, setToken] = useState<string | null>(null);

    const pathname = usePathname();

    // 💡 useEffect는 항상 위에 선언되어야 함
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem("auth-storage");
            const parsed = raw ? JSON.parse(raw) : null;
            const storedToken = parsed?.state?.accessToken;
            setToken(storedToken || null);
        }
    }, []);

    // 숨길 경로
    const hiddenPaths = [
        '/login',
        '/admin',
        '/customer/signup',
        '/customer/member/login',
        '/customer/cart',
        '/seller/login',
    ];
    const shouldHide = hiddenPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (shouldHide) return null;

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg z-50"
            >
                💬
            </button>

            {open && (
                <div className="fixed bottom-20 right-4 w-80 h-96 bg-white shadow-lg rounded-xl border z-50 p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold">AI 챗봇</h2>
                        <button onClick={() => setOpen(false)}>✖️</button>
                    </div>

                    <div className="flex-1 overflow-y-auto text-sm text-gray-800">
                        <p className="mb-1 text-right text-blue-600">{input}</p>
                        <p className="mb-1 text-left text-gray-800">{response}</p>
                    </div>

                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (!input.trim() || !token) return;

                            try {
                                const res = await axios.post(
                                    'http://localhost:8080/api/chat',
                                    { message: input },
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                        withCredentials: true,
                                    }
                                );
                                setResponse(res.data.reply);
                            } catch (err: any) {
                                setResponse("❌ 응답 중 오류가 발생했습니다.");
                                console.error(err);
                            }
                            setInput('');
                        }}
                        className="mt-2"
                    >
                        <input
                            type="text"
                            placeholder="메시지를 입력하세요"
                            className="w-full border px-2 py-1 rounded"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </form>
                </div>
            )}
        </div>
    );
}
