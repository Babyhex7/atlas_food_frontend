'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { RecallWizard } from '@/internal/domain/recall/components/RecallWizard';
import { getRecallSession } from '@/internal/domain/recall/services/recallStorage';
import { getAccessToken } from '@/internal/lib/cookies';
import { CollabSession } from '@/internal/domain/collab';

type Gate = 'checking' | 'ready' | 'redirecting';

function RecallPageInner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const accessToken = Array.isArray(params.accessToken)
    ? params.accessToken[0]
    : params.accessToken ?? '';
  // Link undangan membawa URL milik pengundang — termasuk access token miliknya.
  // Kehadiran ?room= adalah penanda "saya datang sebagai tamu", bukan pemilik
  // sesi recall di URL ini.
  const roomFromQuery = searchParams.get('room')?.trim() || null;
  const [gate, setGate] = useState<Gate>('checking');
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      if (!getAccessToken()) {
        if (!cancelled) setGate('redirecting');
        router.replace('/login');
        return;
      }

      const session = getRecallSession();
      const ownsSession = Boolean(session?.survey_id) && session?.access_token === accessToken;

      if (!ownsSession) {
        // Tamu dengan link room tetap boleh masuk: seluruh gunanya undangan adalah
        // bisa menonton & mengikuti layar rekan. Tanpa jalur ini, setiap penerima
        // undangan recall dilempar ke /surveys dan fitur share-nya mati total.
        if (roomFromQuery) {
          if (!cancelled) {
            setGuest(true);
            setGate('ready');
          }
          return;
        }
        if (!cancelled) setGate('redirecting');
        router.replace('/surveys');
        return;
      }

      if (!cancelled) {
        setGuest(false);
        setGate('ready');
      }
    };

    // Defer to avoid sync setState-in-effect lint and let router settle
    const t = window.setTimeout(run, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [accessToken, roomFromQuery, router]);

  if (gate !== 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Memuat survey...
      </div>
    );
  }

  return (
    <CollabSession
      roomPrefix="recall"
      autoConnect
      // Room bawaan survei ini hanya dipakai saat pengguna datang lewat surveinya
      // sendiri. Bila ada ?room= dari undangan, room itulah yang harus dipakai —
      // fixedRoomId lebih diprioritaskan di CollabSession, jadi harus dikosongkan
      // di sini supaya tamu tidak berakhir di room-nya sendiri dan merasa "sepi".
      fixedRoomId={roomFromQuery ? null : `recall-${accessToken}`}
    >
      <RecallWizard guest={guest} />
    </CollabSession>
  );
}

export default function RecallPage() {
  // useSearchParams butuh Suspense boundary di App Router.
  return (
    <Suspense fallback={null}>
      <RecallPageInner />
    </Suspense>
  );
}
