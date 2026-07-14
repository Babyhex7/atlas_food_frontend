'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSurveyStore } from '@/internal/domain/survey/store/useSurveyStore';
import { Button } from '@/internal/pkg/components/Button';

function ProgressBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>{label}</span>
      <div className="progress" style={{ flex: 1 }}><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-muted)', flexShrink: 0 }}>{pct}% Complete</span>
    </div>
  );
}

const PORTION_OPTIONS = [
  { label: '50g',  gram: 50  },
  { label: '80g',  gram: 80  },
  { label: '110g', gram: 110 },
  { label: '140g', gram: 140 },
  { label: '160g', gram: 160 },
  { label: '200g', gram: 200 },
  { label: '230g', gram: 230 },
  { label: '250g', gram: 250 },
];

export default function PortionPage({ params }: { params: { accessToken: string } }) {
  const router = useRouter();
  const { meals, setFoodPortion } = useSurveyStore();
  const allFoods = meals.flatMap((m) => m.foods.map((f) => ({ ...f, mealId: m.id, mealName: m.name })));
  const [currentIndex, setCurrentIndex] = useState(0);

  if (allFoods.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No foods added yet.</p>
        <Button onClick={() => router.push(`/surveys/${params.accessToken}/add-food`)}>← Back to Add Food</Button>
      </div>
    );
  }

  const currentFood = allFoods[currentIndex];
  const isLast = currentIndex === allFoods.length - 1;

  const handleSelectPortion = (gram: number, label: string) => {
    setFoodPortion(currentFood.mealId, currentFood.id, gram, label);
  };

  const handleNext = () => {
    if (!isLast) setCurrentIndex((i) => i + 1);
    else router.push(`/surveys/${params.accessToken}/review`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: 'var(--space-8) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          <ProgressBar label="Progress" pct={60} />

          {/* Title */}
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-2)' }}>
              How much did you have?
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              {currentFood.name} · {currentFood.mealName}
            </p>
          </div>

          {/* Food pill nav */}
          {allFoods.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {allFoods.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  style={{
                    padding: '4px 14px', borderRadius: 'var(--radius-full)', border: '1.5px solid',
                    borderColor: i === currentIndex ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: i === currentIndex ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: i === currentIndex ? 'white' : 'var(--color-text-muted)',
                    fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)',
                    cursor: 'pointer', transition: 'var(--transition-fast)', fontFamily: 'var(--font-sans)',
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}

          {/* Portion grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 'var(--space-4)' }}>
            {PORTION_OPTIONS.map((opt) => {
              const selected = currentFood.portionGram === opt.gram;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleSelectPortion(opt.gram, opt.label)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-xl)',
                    border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: selected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                    cursor: 'pointer', transition: 'var(--transition-base)', fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.borderColor = 'var(--color-primary-border)'; e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'; }}}
                  onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'var(--color-surface)'; }}}
                >
                  {/* Image placeholder */}
                  <div style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', position: 'relative' }}>
                    🍽️
                    <span style={{ position: 'absolute', bottom: 4, right: 4, fontSize: '10px', fontWeight: 'var(--weight-bold)', color: 'white', backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 'var(--radius-sm)', padding: '1px 5px' }}>
                      {opt.label}
                    </span>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: selected ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Total weight display */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '2px solid var(--color-primary-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)',
              maxWidth: 280, margin: '0 auto', width: '100%',
            }}
          >
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
              Total Weight
            </span>
            <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', lineHeight: 1 }}>
              {currentFood.portionGram || 0}g
            </span>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={() => router.back()} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ‹ Back
        </button>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          {allFoods.length > 1 && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {currentIndex + 1} / {allFoods.length}
            </span>
          )}
          <Button onClick={handleNext}>
            {isLast ? 'Finish ›' : 'Next Food ›'}
          </Button>
        </div>
      </div>
    </div>
  );
}
