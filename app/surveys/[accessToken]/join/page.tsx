'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/internal/pkg/components/Button';
import { CONTAINER_CLASS } from '@/internal/lib/layout';
import { AppHeader } from '@/internal/components/layout/AppHeader';
import { Utensils, AlertCircle } from 'lucide-react';
import { apiClient as api } from '@/internal/lib/axios';
import { initRecallSession } from '@/internal/domain/recall/services/recallStorage';
import { getAccessToken } from '@/internal/lib/cookies';
import { cn } from '@/internal/lib/cn';
import { loginWithRedirect } from '@/internal/lib/layout';
import { getApiErrorMessage } from '@/internal/pkg/utils/apiError';
import { useAuthStore } from '@/internal/domain/auth/store/authStore';

type MealConfig = { name: string; time: string };

const DEFAULT_MEALS: MealConfig[] = [
  { name: 'Sarapan', time: '07:00' },
  { name: 'Makan Siang', time: '12:00' },
  { name: 'Makan Malam', time: '19:00' },
];

function resolveAlias(user: { name?: string; email?: string; id?: string } | null | undefined): string {
  const name = user?.name?.trim();
  if (name) return name;
  const email = user?.email?.trim();
  if (email) return email.split('@')[0] || email;
  if (user?.id) return `RESP-${user.id.slice(0, 8)}`;
  return 'Responden';
}

export default function JoinSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const accessToken = params.accessToken as string;
  const session = useAuthStore((s) => s.session);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (!getAccessToken()) {
      router.push(loginWithRedirect(`/surveys/${accessToken}/join`));
      return;
    }

    const alias = resolveAlias(session?.user);
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/survey/access', { token: accessToken, alias });
      const data = response.data.data;
      const surveyInfo = data.survey;
      const participant = data.participant;
      const mealsConfig = surveyInfo.meals_config;
      const rawMeals: MealConfig[] = Array.isArray(mealsConfig)
        ? mealsConfig
        : Array.isArray((mealsConfig as { meals?: MealConfig[] })?.meals)
        ? (mealsConfig as { meals: MealConfig[] }).meals
        : DEFAULT_MEALS;
      const parsedMeals = rawMeals.length > 0
        ? rawMeals.map((m: MealConfig) => ({ name: m.name, time: m.time || '07:00' }))
        : DEFAULT_MEALS;

      initRecallSession({
        survey_id: surveyInfo.id,
        access_token: accessToken,
        participant_id: participant.id,
        respondent_name: participant.alias || alias,
        available_meals: parsedMeals,
      });
      router.push(`/surveys/${accessToken}/recall`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Gagal masuk ke survey. Pastikan link dari admin masih aktif.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <div className={cn(CONTAINER_CLASS, 'flex-1 flex items-center justify-center py-10 px-4')}>
        <div className="card w-full max-w-[440px] p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary">
              <Utensils size={28} />
            </div>
          </div>

          <h1 className="text-xl font-bold text-text-primary text-center mb-2 mt-0">
            Mulai Survey Konsumsi
          </h1>
          <p className="text-sm text-text-muted text-center mb-8 leading-relaxed">
            Anda masuk lewat link dari admin. Tekan mulai untuk membuka dietary recall —
            tidak perlu mengisi kode responden.
          </p>

          <div className="flex flex-col gap-4">
            {error && (
              <div className="alert alert-danger text-sm flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-px" />
                {error}
              </div>
            )}

            <Button className="w-full" onClick={handleStart} isLoading={loading} size="lg">
              Mulai Survey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
