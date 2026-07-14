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

type MealConfig = { name: string; time: string };

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
    if (!alias.trim()) { setError('Masukkan alias/nama peserta'); return; }
    if (!getAccessToken()) { router.push('/login'); return; }
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/survey/access', { token: accessToken, alias: alias.trim() });
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
        respondent_name: alias.trim(),
        available_meals: parsedMeals,
      });
      router.push(`/surveys/${accessToken}/recall`);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err &&
        (err as any).response?.data?.error?.message
          ? String((err as any).response.data.error.message)
          : 'Gagal masuk ke survey. Pastikan token & alias benar.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <div
        className={CONTAINER_CLASS}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-10) var(--space-4)' }}
      >
        <div
          className="card"
          style={{ width: '100%', maxWidth: 440, padding: 'var(--space-8)' }}
        >
          {/* Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <div
              style={{
                width: 64, height: 64,
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <Utensils size={28} />
            </div>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', textAlign: 'center', margin: '0 0 var(--space-2)' }}>
            Mulai Survey Konsumsi
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', margin: '0 0 var(--space-8)', lineHeight: 'var(--leading-relaxed)' }}>
            Masukkan Alias atau Kode Responden yang diberikan oleh peneliti untuk memulai.
          </p>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label
                htmlFor="alias"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-secondary)' }}
              >
                Kode Responden
              </label>
              <input
                id="alias"
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder="Misal: RESPONDENT-001"
                style={{
                  width: '100%',
                  padding: '0.625rem var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  transition: 'var(--transition-base)',
                  fontFamily: 'var(--font-sans)',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'var(--focus-ring)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <div className="alert alert-danger" style={{ fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                {error}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleStart}
              isLoading={loading}
              disabled={!alias.trim()}
              size="lg"
            >
              Mulai Survey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
