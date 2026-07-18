'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RecallWizard } from '@/internal/domain/recall/components/RecallWizard';
import { getRecallSession } from '@/internal/domain/recall/services/recallStorage';
import { getAccessToken } from '@/internal/lib/cookies';
import { CollabSession } from '@/internal/domain/collab';

type Gate = 'checking' | 'ready' | 'redirecting';

export default function RecallPage() {
  const router = useRouter();
  const params = useParams();
  const accessToken = Array.isArray(params.accessToken)
    ? params.accessToken[0]
    : params.accessToken ?? '';
  const [gate, setGate] = useState<Gate>('checking');

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      if (!getAccessToken()) {
        if (!cancelled) setGate('redirecting');
        router.replace('/login');
        return;
      }

      const session = getRecallSession();
      if (!session?.survey_id || session.access_token !== accessToken) {
        if (!cancelled) setGate('redirecting');
        router.replace(`/surveys/${accessToken}/join`);
        return;
      }

      if (!cancelled) setGate('ready');
    };

    // Defer to avoid sync setState-in-effect lint and let router settle
    const t = window.setTimeout(run, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [accessToken, router]);

  if (gate !== 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Memuat survey...
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <CollabSession
        roomPrefix="recall"
        autoConnect
        fixedRoomId={`recall-${accessToken}`}
      >
        <RecallWizard />
      </CollabSession>
    </Suspense>
  );
}
