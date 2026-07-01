'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/internal/pkg/components/Button';
import { CONTAINER_CLASS } from '@/internal/lib/layout';
import { AppHeader } from '@/internal/components/layout/AppHeader';
import { Utensils } from 'lucide-react';
import { apiClient as api } from '@/internal/lib/axios';
import { initRecallSession } from '@/internal/domain/recall/services/recallStorage';
import { getAccessToken } from '@/internal/lib/cookies';

type MealConfig = {
  name: string;
  time: string;
};

const DEFAULT_MEALS: MealConfig[] = [
  { name: 'Sarapan', time: '07:00' },
  { name: 'Makan Siang', time: '12:00' },
  { name: 'Makan Malam', time: '19:00' },
];

export default function JoinSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const accessToken = params.accessToken as string;
  
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (!alias.trim()) {
      setError('Masukkan alias/nama peserta');
      return;
    }

    if (!getAccessToken()) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/survey/access', {
        token: accessToken,
        alias: alias.trim(),
      });

      const data = response.data.data;
      const surveyInfo = data.survey;
      const participant = data.participant;

      const mealsConfig = surveyInfo.meals_config;
      // Backend returns { meals: [...] } wrapped shape
      const rawMeals: MealConfig[] = Array.isArray(mealsConfig)
        ? mealsConfig
        : Array.isArray((mealsConfig as { meals?: MealConfig[] })?.meals)
        ? (mealsConfig as { meals: MealConfig[] }).meals
        : DEFAULT_MEALS;

      const parsedMeals: MealConfig[] = rawMeals.length > 0
        ? rawMeals.map((m: MealConfig) => ({
            name: m.name,
            time: m.time || '07:00',
          }))
        : DEFAULT_MEALS;

      initRecallSession({
        survey_id: surveyInfo.id,
        access_token: accessToken,
        participant_id: participant.id,
        respondent_name: alias.trim(),
        available_meals: parsedMeals,
      });

      router.push(`/surveys/${accessToken}/recall`);
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'error' in err.response.data &&
        err.response.data.error &&
        typeof err.response.data.error === 'object' &&
        'message' in err.response.data.error
          ? String(err.response.data.error.message)
          : 'Gagal masuk ke survey. Pastikan token & alias benar.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className={`${CONTAINER_CLASS} py-10 flex-1 flex items-center justify-center`}>
        <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Utensils className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Mulai Survey Konsumsi</h1>
          <p className="text-muted text-center mb-8">
            Silakan masukkan Alias atau Kode Responden yang diberikan oleh peneliti untuk memulai.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kode Responden</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="Misal: RESPONDENT-001"
                className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                {error}
              </p>
            )}

            <Button
              className="w-full"
              onClick={handleStart}
              disabled={loading || !alias.trim()}
            >
              {loading ? 'Memuat...' : 'Mulai Survey'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
