

import { Suspense } from 'react';
import RegisterPage from './RegisterPage';


export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-20">로딩 중...</div>}>
      <RegisterPage/>
    </Suspense>
  );
}
