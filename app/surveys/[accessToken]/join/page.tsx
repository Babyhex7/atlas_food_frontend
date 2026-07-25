'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getAccessToken } from '@/internal/lib/cookies';
import { loginWithRedirect } from '@/internal/lib/layout';

/**
 * Join via link dihapus — semua responden login lalu pilih survey di /surveys.
 * Route lama diarahkan ke hub agar bookmark/link lama tidak buntu.
 */
export default function JoinSurveyPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(loginWithRedirect('/surveys'));
      return;
    }
    router.replace('/surveys');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
