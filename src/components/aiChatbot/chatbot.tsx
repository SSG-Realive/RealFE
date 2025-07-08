'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';

export default function ChatBotWidget() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<
        { sender: 'user' | 'bot'; text: string }[]
    >([]);
    const [token, setToken] = useState<string | null>(null);

    const pathname = usePathname();

    // 토큰 가져오기
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('seller-auth-storage') || localStorage.getItem('auth-storage');
            const parsed = raw ? JSON.parse(raw) : null;
            const storedToken = parsed?.state?.accessToken;
            setToken(storedToken || null);
        }
    }, []);

    // sessionStorage에서 이전 대화 불러오기
    useEffect(() => {
        const stored = sessionStorage.getItem('chat-history');
        if (stored) {
            setMessages(JSON.parse(stored));
        }
    }, []);

    // 대화 저장
    useEffect(() => {
        sessionStorage.setItem('chat-history', JSON.stringify(messages));
    }, [messages]);

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

    // 전송 핸들러
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || !token) return;

        const userMsg = { sender: 'user' as const, text: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');

        try {
            const res = await axios.post(
                'http://localhost:8080/api/chat',
                { message: trimmed },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            const botMsg = {
                sender: 'bot' as const,
                text: res.data.reply || '❌ 답변을 받을 수 없습니다.',
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { sender: 'bot', text: '❌ 응답 중 오류가 발생했습니다.' },
            ]);
            console.error(err);
        }
    };

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg z-50"
            >
                💬
            </button>

            {open && (
                <div className="fixed bottom-20 right-4 w-80 h-96 bg-white shadow-lg rounded-xl border border-gray-300 z-50 flex flex-col">

                    {/* 상단 전체 검정 배경 헤더 */}
                    <div className="bg-black text-white px-4 py-2 rounded-t-xl flex justify-between items-center">
                        <h2 className="text-lg font-bold">Realive</h2>
                        <button onClick={() => setOpen(false)} className="text-white text-xl">
                            ⨉
                        </button>
                    </div>

                    {/* 메시지 영역 및 입력창 */}
                    <div className="flex-1 overflow-y-auto mb-2 space-y-2 p-4 pr-1">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`inline-block px-3 py-2 rounded-lg text-sm break-words ${
                                        msg.sender === 'user'
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-gray-200 text-black rounded-bl-none'
                                    }`}
                                    style={{ maxWidth: '80%' }}
                                    dangerouslySetInnerHTML={{
                                        __html: msg.text.replace(/\n/g, '<br />'),
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* 입력창 */}
                    <form
                        onSubmit={sendMessage}
                        className="px-4 pb-4 mt-auto flex gap-2 items-center relative"
                    >
                        <input
                            type="text"
                            placeholder={token ? '메시지를 입력하세요' : '로그인 후 이용해주세요'}
                            className="flex-1 border border-gray-300 px-3 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            readOnly={!token}
                            style={
                                !token ? { pointerEvents: 'none', userSelect: 'none' } : undefined
                            }
                        />
                        {input.trim() && token && (
                            <button
                                type="submit"
                                className="absolute right-6 p-2 bg-blue-500 text-white rounded-full transition hover:bg-blue-600 active:scale-95"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
}

