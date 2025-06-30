'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  fetchMyProfile,
  updateMyProfile,
} from '@/service/customer/customerService';
import {
  MemberModifyDTO,
  MemberReadDTO,
} from '@/types/customer/member/member';
import AddressInput from '@/components/customer/join/AddressInput';
import useDialog from '@/hooks/useDialog';
import GlobalDialog from '@/components/ui/GlobalDialog';
import { parseAddress } from '@/lib/address-utils';
import { Pencil } from 'lucide-react';

function ReadOnlyCard({ label, value }: { label: string; value?: string | null }) {
  return (
    <section className="rounded-2xl bg-white/90 p-5 shadow ring-1 ring-gray-100">
      <h2 className="mb-2 text-sm font-medium text-gray-500">{label}</h2>
      <p className="text-[17px] sm:text-base text-gray-800 break-words">
        {value || '-'}
      </p>
    </section>
  );
}

/* 2) 편집 가능한 카드 */
function EditableCard(props: {
  label: string;
  value: string;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  input: React.ReactNode;
}) {
  const { label, value, editing, onEdit, onCancel, input } = props;

  return (
    <section className="rounded-2xl bg-white/90 p-5 shadow ring-1 ring-gray-100 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-500">{label}</h2>
        {!editing && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded p-1 text-gray-400 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">수정</span>
          </button>
        )}
      </div>

      {editing ? (
        <>
          {input}
          <button
            type="button"
            onClick={onCancel}
            className="self-start text-sm text-gray-400 hover:text-gray-600"
          >
            취소
          </button>
        </>
      ) : (
        <p className="text-[17px] sm:text-base text-gray-800 break-words">
          {value}
        </p>
      )}
    </section>
  );
}
export default function EditProfilePage() {
  const router = useRouter();

  const { open, message, setOpen, show } = useDialog();

  /* ---------------- data ---------------- */
  const [profile, setProfile] = useState<MemberReadDTO | null>(null);

  /** local 편집 상태  */
  const [phoneEdit,   setPhoneEdit]   = useState(false);
  const [addrEdit,    setAddrEdit]    = useState(false);

  const [phone, setPhone]           = useState('');
  const [addrStr, setAddrStr]       = useState('');      
    const [saving, setSaving] = useState(false);
  /* ------------ fetch my info ------------ */
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyProfile();
        setProfile(data);
        setPhone(data.phone ?? '');
        setAddrStr(data.address ?? '');
      } catch {
        show('프로필을 가져오지 못했습니다.');
      }
    })();
  }, []);

  /* ------------ 저장 ------------ */
  async function handleSubmit() {
    const payload = {
      phone: phone.trim() || undefined,
      address: addrStr.trim() || undefined,
    };
    try {
        setSaving(true);
      await updateMyProfile(payload);
      show('수정이 완료되었습니다.');
      setPhoneEdit(false);
      setAddrEdit(false);
      // 최신 정보 다시 반영
      setProfile((p) => p ? { ...p, phone: payload.phone!, address: payload.address! } : p);
    } catch {
      show('저장에 실패했습니다.');
    }
  }

  if (!profile) {
    return (
      <>
        <p className="p-6 text-center text-gray-500">로딩 중…</p>
      </>
    );
  }

  /* ---------- UI ---------- */
  const parsedAddr = parseAddress(addrStr);

  return (
  <>
    <GlobalDialog open={open} message={message} onClose={() => setOpen(false)} />
    <Navbar />

    <main className="mx-auto w-full max-w-xl px-4 py-10 space-y-6">

      {/* ───── 이름 카드 ───── */}
      <ReadOnlyCard label="이름"       value={profile.name} />

      {/* ───── 이메일 카드 ───── */}
      <ReadOnlyCard label="이메일"     value={profile.email} />

      {/* ───── 생년월일 카드 ───── */}
      <ReadOnlyCard label="생년월일"   value={profile.birth ?? '-'} />

      {/* ───── 가입일 카드 ───── */}
      <ReadOnlyCard
        label="가입일"
        value={new Date(profile.created).toLocaleDateString()}
      />

      {/* ───── 전화번호 카드 (편집 가능) ───── */}
      <EditableCard
        label="전화번호"
        editing={phoneEdit}
        value={phone || '-'}
        onEdit={() => setPhoneEdit(true)}
        onCancel={() => {
          setPhone(profile.phone ?? '');
          setPhoneEdit(false);
        }}
        input={
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm ring-amber-300 focus:border-amber-500 focus:ring"
          />
        }
      />

      {/* ───── 주소 카드 (편집 가능) ───── */}
      <EditableCard
        label="주소"
        editing={addrEdit}
        value={
          addrStr
            ? `${parseAddress(addrStr).address} ${parseAddress(addrStr).detail}`
            : '-'
        }
        onEdit={() => setAddrEdit(true)}
        onCancel={() => {
          setAddrStr(profile.address ?? '');
          setAddrEdit(false);
        }}
        input={
          <AddressInput
            onAddressChange={setAddrStr}
            defaultAddress={parseAddress(addrStr)}
          />
        }
      />

      {/* 저장·취소 버튼 (둘 중 하나라도 편집 중일 때만 노출) */}
      {(phoneEdit || addrEdit) && (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setPhone(profile.phone ?? '');
              setAddrStr(profile.address ?? '');
              setPhoneEdit(false);
              setAddrEdit(false);
            }}
            className="rounded-md px-4 py-2 text-sm ring-1 ring-gray-300 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-md bg-amber-500 px-5 py-2 text-sm font-medium text-white shadow hover:bg-amber-600 disabled:opacity-50"
          >
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      )}
    </main>
  </>
);
}
