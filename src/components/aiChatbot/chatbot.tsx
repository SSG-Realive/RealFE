'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import customerApi from "@/lib/apiClient";

export default function ChatBotWidget() {
    // 챗봇 열림/닫힘 상태
    const [open, setOpen] = useState(false);
    // 사용자 입력 메시지 상태
    const [input, setInput] = useState('');
    // GPT 응답 상태
    const [response, setResponse] = useState('');

    // 현재 페이지 경로 가져오기
    const pathname = usePathname();

    // 챗봇 버튼/창을 숨길 경로 목록
    const hiddenPaths = [
        '/login',
        '/admin',
        '/customer/signup',
        '/customer/member/login',
        '/customer/cart',
    ];

    // 현재 경로가 hiddenPaths에 포함되면 챗봇 표시 안 함
    const shouldHide = hiddenPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );
    if (shouldHide) return null;

    return (
        <div>
            {/* 고정된 챗봇 열기 버튼 */}
            <button
                onClick={() => setOpen(!open)} // 클릭 시 챗봇 열기/닫기 토글
                className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg z-50"
            >
                💬
            </button>

            {/* 챗봇 창 */}
            {open && (
                <div className="fixed bottom-20 right-4 w-80 h-96 bg-white shadow-lg rounded-xl border z-50 p-4 flex flex-col">
                    {/* 상단 타이틀과 닫기 버튼 */}
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold">AI 챗봇</h2>
                        <button onClick={() => setOpen(false)}>✖️</button>
                    </div>

                    {/* 채팅 내용 표시 영역 */}
                    <div className="flex-1 overflow-y-auto text-sm text-gray-800">
                        <p className="mb-1 text-right text-blue-600">{input}</p>
                        <p className="mb-1 text-left text-gray-800">{response}</p>
                    </div>

                    {/* 입력 폼 */}
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (!input.trim()) return;

                            // 사용자가 입력한 메시지를 백엔드로 전송
                            const res = await customerApi.post('/chat', {
                                message: input,
                            });

                            // 응답 받아서 상태에 저장
                            const data = res.data;
                            setResponse(data.reply);
                            setInput(''); // 입력창 초기화
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
