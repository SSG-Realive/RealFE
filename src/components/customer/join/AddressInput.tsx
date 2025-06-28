import React, { useState } from 'react';
import DaumPostcode, { Address, DaumPostcodeEmbedProps } from 'react-daum-postcode';

interface AddressInputProps {
  onAddressChange?: (fullAddress: string) => void;
  defaultAddress?:{
  zonecode : string;
  address: string;
  detail : string;
};
}

/* ------------ 주소 문자열 <-> 객체 헬퍼 ------------- */
const SEP = '|';                           // 구분자

/**  "48060|도로명주소|상세"  →  { zonecode, address, detail }  */
function parseAddress(str = '') {
  const [zonecode = '', addr = '', detail = ''] = str.split(SEP);
  return { zonecode, address: addr, detail };
}

/**  { zonecode, address, detail } → "48060|도로명주소|상세"  */
function joinAddress(obj: { zonecode: string; address: string; detail: string }) {
  return [obj.zonecode, obj.address, obj.detail].join(SEP);
}


const AddressInput: React.FC<AddressInputProps> = ({ onAddressChange, defaultAddress }) => {
 /* ───────── state ───────── */
  const [zonecode,         setZonecode]       = useState(defaultAddress?.zonecode ?? "");
  const [address,          setAddress]        = useState(defaultAddress?.address  ?? "");
  const [detailedAddress,  setDetailedAddress]= useState(defaultAddress?.detail   ?? "");
  const [isOpen,           setIsOpen]         = useState(false);

  const postCodeStyle: React.CSSProperties = {
    width: '360px',
    height: '480px',
  };

  /* ───────── 주소 문자열 합치기 ───────── */
  const updateFullAddress = (base: string, detail: string) => {
    const full = joinAddress({ zonecode, address: base, detail });
    onAddressChange?.(full);          // 부모(form) 로 전파
  };

  /* ───────── 다음주소 완료 핸들러 ───────── */
  const completeHandler = (data: Address) => {
    const { address: roadAddr, zonecode } = data;
    setZonecode(zonecode);
    setAddress(roadAddr);
    updateFullAddress(roadAddr, detailedAddress);
    setIsOpen(false);
  };

  /* ───────── 상세주소 입력 핸들러 ───────── */
  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDetailedAddress(value);
    updateFullAddress(address, value);
  };

  

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={zonecode}
          placeholder="우편번호"
          readOnly
          className="border rounded px-2 py-1 w-32"
        />
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="border rounded px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200"
        >
          주소 찾기
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 border p-2">
          <DaumPostcode
            style={postCodeStyle}
            onComplete={completeHandler}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}

      <input
        type="text"
        value={address}
        placeholder="기본 주소"
        readOnly
        className="border rounded px-2 py-1 w-full"
      />
      <input
        type="text"
        value={detailedAddress}
        onChange={inputChangeHandler}
        placeholder="상세 주소 입력"
        className="border rounded px-2 py-1 w-full"
      />
    </div>
  );
};

export default AddressInput;