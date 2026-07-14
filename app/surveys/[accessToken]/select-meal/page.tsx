'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/internal/pkg/components/Button';
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: 'var(--space-8) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {children}
        </div>
      </div>
      {footer}
    </div>
  );
}

function ProgressBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
        {label}
      </span>
      <div className="progress" style={{ flex: 1 }}>
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-muted)', flexShrink: 0 }}>
        {pct}% Complete
      </span>
    </div>
  );
}

function WizardFooter({ onBack, onContinue, continueLabel = 'Continue ›', disabled = false }: {
  onBack?: () => void; onContinue?: () => void; continueLabel?: string; disabled?: boolean;
}) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <button
        type="button"
        onClick={onBack}
        style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'var(--transition-fast)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
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
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-2)' }}>
          Select Meal Time
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
          Please identify which meal you are recording and the specific time it occurred.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-6)' }}>

        {/* Meal type selector */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: '0 0 var(--space-4)' }}>
            <Utensils size={14} /> Select Meal Type
          </p>
          <div className="grid grid-cols-2" style={{ gap: 'var(--space-3)' }}>
            {MEAL_TYPES.map((type) => {
              const active = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-4) var(--space-3)',
                    borderRadius: 'var(--radius-xl)',
                    border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: active ? 'var(--color-primary-light)' : 'var(--color-surface)',
                    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    cursor: 'pointer', transition: 'var(--transition-base)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--color-primary-border)'; e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'; }}}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'var(--color-surface)'; }}}
                >
                  {type.icon}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)' }}>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Time picker */}
          <div className="card" style={{ padding: 'var(--space-5)', flex: 1 }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: '0 0 var(--space-5)' }}>
              <Clock size={14} /> Specific Time
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              {/* Hour */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)' }}>
                <button type="button" onClick={() => setHour((h) => h === 12 ? 1 : h + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>▲</button>
                <span style={{ fontSize: '2.5rem', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  {String(hour).padStart(2, '0')}
                </span>
                <button type="button" onClick={() => setHour((h) => h === 1 ? 12 : h - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>▼</button>
              </div>
              <span style={{ fontSize: '2rem', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', marginBottom: 4 }}>:</span>
              {/* Minute */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)' }}>
                <button type="button" onClick={() => setMinute((m) => (m + 5) % 60)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>▲</button>
                <span style={{ fontSize: '2.5rem', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  {String(minute).padStart(2, '0')}
                </span>
                <button type="button" onClick={() => setMinute((m) => (m - 5 + 60) % 60)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>▼</button>
              </div>
              {/* AM/PM */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                {(['AM', 'PM'] as const).map((p) => (
                  <button key={p} type="button" onClick={() => setPeriod(p)}
                    style={{
                      padding: '6px 16px', border: 'none', cursor: 'pointer',
                      fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-sans)',
                      backgroundColor: period === p ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: period === p ? 'white' : 'var(--color-text-muted)',
                      transition: 'var(--transition-fast)',
                    }}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Info tip */}
          <div className="alert alert-primary">
            <Info size={16} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--text-xs)' }}>
              Accurately recording your meal times helps us analyze your body's metabolic rhythm with greater precision.
            </span>
          </div>
        </div>
      </div>

      {/* Guided banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #7B0011 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          color: 'white',
        }}
      >
        <p style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)', margin: '0 0 var(--space-1)' }}>Guided Nutrition</p>
        <p style={{ fontSize: 'var(--text-sm)', opacity: 0.85, margin: 0 }}>
          Each step in this survey has been designed by professional nutritionists to provide personalized recommendations.
        </p>
      </div>
    </WizardShell>
  );
}
