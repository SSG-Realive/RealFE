'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useDialog from '@/hooks/useDialog';
import GlobalDialog from '@/components/ui/GlobalDialog';

type Step = 'enterEmail' | 'verifyCode' | 'newPassword';

export default function FindPasswordMultiStep() {
  const [step, setStep] = useState<Step>('enterEmail');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const { show, open, message, handleClose } = useDialog();
  const router = useRouter();

  // NEXT_PUBLIC_API_BASE_URL는 예: "http://localhost:8080/api"
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const post = async (path: string, body: any) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || '에러가 발생했습니다.');
    }
  };

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { show('이메일을 입력해주세요.'); return; }
    setLoading(true);
    try {
      await post('/public/password-reset/request', { email });
      await show('인증번호를 발송했습니다.');
      setStep('verifyCode');
    } catch (err: any) {
      show(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { show('인증번호를 입력해주세요.'); return; }
    setLoading(true);
    try {
      await post('/public/password-reset/verify', { email, code });
      await show('인증에 성공했습니다.');
      setStep('newPassword');
    } catch (err: any) {
      show(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || !confirmPass) {
      show('새 비밀번호를 모두 입력해주세요.');
      return;
    }
    if (newPass !== confirmPass) {
      show('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await post('/public/password-reset/confirm', {
        email,
        newPassword: newPass,
        confirmPassword: confirmPass,
      });
      // 다이얼로그 확인 후 로그인 페이지로 이동
      await show('비밀번호가 변경되었습니다.');
      router.push('/customer/member/login');
    } catch (err: any) {
      show(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalDialog open={open} message={message} onClose={handleClose} />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">

          {step === 'enterEmail' && (
            <form onSubmit={onEmailSubmit}>
              <h1 className="text-2xl font-light mb-4">비밀번호 찾기</h1>
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4 focus:ring"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                {loading ? '요청 중…' : '인증번호 발송'}
              </button>
            </form>
          )}

          {step === 'verifyCode' && (
            <form onSubmit={onCodeSubmit}>
              <h1 className="text-2xl font-light mb-4">인증번호 확인</h1>
              <p className="mb-2 text-sm text-gray-600">{email}로 발송된 코드를 입력</p>
              <input
                type="text"
                placeholder="인증번호"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4 focus:ring"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                {loading ? '검증 중…' : '코드 검증'}
              </button>
              <button
                type="button"
                onClick={() => setStep('enterEmail')}
                className="mt-2 text-sm text-gray-500 underline"
              >
                이메일 다시 입력
              </button>
            </form>
          )}

          {step === 'newPassword' && (
            <form onSubmit={onPasswordSubmit}>
              <h1 className="text-2xl font-light mb-4">새 비밀번호 설정</h1>
              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4 focus:ring"
                required
              />
              <input
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-6 focus:ring"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                {loading ? '변경 중…' : '비밀번호 변경'}
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  );
}
