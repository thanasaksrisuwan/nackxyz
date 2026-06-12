'use client';

import { Suspense } from 'react';
import ChallengePage from '../../../audit/pages/ChallengePage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ChallengePage />
    </Suspense>
  );
}
