'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/internal/pkg/components/Button';
import { cn } from '@/internal/lib/cn';
import { Utensils, Coffee, Croissant, Info, Clock } from 'lucide-react';

const MEAL_TYPES = [
  { id: 'breakfast',       label: 'Breakfast',       icon: <Utensils size={22} /> },
  { id: 'morning_snack',   label: 'Morning Snack',   icon: <Coffee size={22} /> },
  { id: 'lunch',           label: 'Lunch',           icon: <Utensils size={22} /> },
  { id: 'afternoon_snack', label: 'Afternoon Snack', icon: <Croissant size={22} /> },
  { id: 'dinner',          label: 'Dinner',          icon: <Utensils size={22} /> },
  { id: 'evening_snack',   label: 'Evening Snack',   icon: <Coffee size={22} /> },
];

/* ── Shared wizard layout helpers ───────────────────── */
function WizardShell({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[820px] mx-auto p-8 px-6 flex flex-col gap-6">
          {children}
        </div>
      </div>
      {footer}
    </div>
  );
}

function ProgressBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-[0.08em] shrink-0">
        {label}
      </span>
      <div className="progress flex-1">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-text-muted shrink-0">
        {pct}% Complete
      </span>
    </div>
  );
}

function WizardFooter({ onBack, onContinue, continueLabel = 'Continue ›', disabled = false }: {
  onBack?: () => void; onContinue?: () => void; continueLabel?: string; disabled?: boolean;
}) {
  return (
    <div className="bg-surface border-t border-border py-4 px-6 flex justify-between items-center">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-text-muted bg-transparent border-none cursor-pointer transition-fast hover:text-text-primary"
      >
        ‹ Back
      </button>
      <Button onClick={onContinue} disabled={disabled}>
        {continueLabel}
      </Button>
    </div>
  );
}

export default function SelectMealPage({ params }: { params: { accessToken: string } }) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('breakfast');
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  return (
    <WizardShell
      footer={
        <WizardFooter
          onBack={() => router.back()}
          onContinue={() => router.push(`/surveys/${params.accessToken}/add-food`)}
          continueLabel="Continue ›"
        />
      }
    >
      <ProgressBar label="Progress" pct={20} />

      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2 mt-0">
          Select Meal Time
        </h1>
        <p className="text-sm text-text-muted m-0">
          Please identify which meal you are recording and the specific time it occurred.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Meal type selector */}
        <div className="card p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted mb-4 mt-0">
            <Utensils size={14} /> Select Meal Type
          </p>
          <div className="grid grid-cols-2 gap-3">
            {MEAL_TYPES.map((type) => {
              const active = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 cursor-pointer transition-base font-sans',
                    active
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-border bg-surface text-text-muted hover:border-primary-border hover:bg-primary-light'
                  )}
                >
                  {type.icon}
                  <span className="text-xs font-semibold">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Time picker */}
          <div className="card p-5 flex-1">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted mb-5 mt-0">
              <Clock size={14} /> Specific Time
            </p>
            <div className="flex items-center justify-center gap-4 mb-5">
              {/* Hour */}
              <div className="flex flex-col items-center gap-1">
                <button type="button" onClick={() => setHour((h) => h === 12 ? 1 : h + 1)} className="bg-transparent border-none cursor-pointer text-text-muted text-[1.2rem] leading-none">▲</button>
                <span className="text-[2.5rem] font-bold text-primary font-mono leading-none">
                  {String(hour).padStart(2, '0')}
                </span>
                <button type="button" onClick={() => setHour((h) => h === 1 ? 12 : h - 1)} className="bg-transparent border-none cursor-pointer text-text-muted text-[1.2rem] leading-none">▼</button>
              </div>
              <span className="text-[2rem] font-bold text-primary mb-1">:</span>
              {/* Minute */}
              <div className="flex flex-col items-center gap-1">
                <button type="button" onClick={() => setMinute((m) => (m + 5) % 60)} className="bg-transparent border-none cursor-pointer text-text-muted text-[1.2rem] leading-none">▲</button>
                <span className="text-[2.5rem] font-bold text-primary font-mono leading-none">
                  {String(minute).padStart(2, '0')}
                </span>
                <button type="button" onClick={() => setMinute((m) => (m - 5 + 60) % 60)} className="bg-transparent border-none cursor-pointer text-text-muted text-[1.2rem] leading-none">▼</button>
              </div>
              {/* AM/PM */}
              <div className="flex flex-col gap-1 border-[1.5px] border-border rounded-lg overflow-hidden">
                {(['AM', 'PM'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'py-1.5 px-4 border-none cursor-pointer font-semibold text-sm font-sans transition-fast',
                      period === p ? 'bg-primary text-white' : 'bg-surface text-text-muted'
                    )}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Info tip */}
          <div className="alert alert-primary">
            <Info size={16} className="shrink-0" />
            <span className="text-xs">
              Accurately recording your meal times helps us analyze your body's metabolic rhythm with greater precision.
            </span>
          </div>
        </div>
      </div>

      {/* Guided banner */}
      <div className="bg-[linear-gradient(135deg,var(--color-primary)_0%,#7B0011_100%)] rounded-xl p-6 text-white">
        <p className="font-bold text-base mb-1 mt-0">Guided Nutrition</p>
        <p className="text-sm opacity-85 m-0">
          Each step in this survey has been designed by professional nutritionists to provide personalized recommendations.
        </p>
      </div>
    </WizardShell>
  );
}
