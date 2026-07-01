'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RecallWizard } from '@/internal/domain/recall/components/RecallWizard';
import { getRecallSession } from '@/internal/domain/recall/services/recallStorage';
import { getAccessToken } from '@/internal/lib/cookies';

export default function RecallPage() {
  const router = useRouter();
  const params = useParams();
  const accessToken = Array.isArray(params.accessToken)
    ? params.accessToken[0]
    : params.accessToken ?? '';
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login');
      return;
    }

    const session = getRecallSession();
    if (!session?.survey_id || session.access_token !== accessToken) {
      router.replace(`/surveys/${accessToken}/join`);
      return;
    }

    setReady(true);
  }, [accessToken, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Memuat survey...
      </div>
    );
  }

  return <RecallWizard />;
}
