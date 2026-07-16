'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSurveyStore } from '@/internal/domain/survey/store/useSurveyStore';
import { Button } from '@/internal/pkg/components/Button';
import { cn } from '@/internal/lib/cn';

function ProgressBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-[0.08em] shrink-0">{label}</span>
      <div className="progress flex-1"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
      <span className="text-xs font-medium text-text-muted shrink-0">{pct}% Complete</span>
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
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <p className="text-text-muted text-sm">No foods added yet.</p>
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
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[820px] mx-auto p-8 px-6 flex flex-col gap-6">

          <ProgressBar label="Progress" pct={60} />

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2 mt-0">
              How much did you have?
            </h1>
            <p className="text-sm text-text-muted m-0">
              {currentFood.name} · {currentFood.mealName}
            </p>
          </div>

          {/* Food pill nav */}
          {allFoods.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {allFoods.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    'py-1 px-3.5 rounded-full border-[1.5px] text-xs font-medium cursor-pointer transition-fast font-sans',
                    i === currentIndex
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-surface text-text-muted'
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}

          {/* Portion grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PORTION_OPTIONS.map((opt) => {
              const selected = currentFood.portionGram === opt.gram;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleSelectPortion(opt.gram, opt.label)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-base font-sans',
                    selected
                      ? 'border-primary bg-primary-light'
                      : 'border-border bg-surface hover:border-primary-border hover:bg-primary-light'
                  )}
                >
                  {/* Image placeholder */}
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-surface-alt flex items-center justify-center text-[2rem] relative">
                    🍽️
                    <span className="absolute bottom-1 right-1 text-[10px] font-bold text-white bg-black/55 rounded-sm py-px px-[5px]">
                      {opt.label}
                    </span>
                  </div>
                  <span className={cn('text-xs font-bold', selected ? 'text-primary' : 'text-text-secondary')}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Total weight display */}
          <div className="bg-surface border-2 border-primary-border rounded-xl p-5 flex flex-col items-center gap-1 max-w-[280px] mx-auto w-full">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
              Total Weight
            </span>
            <span className="text-3xl font-bold text-primary leading-none">
              {currentFood.portionGram || 0}g
            </span>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-surface border-t border-border py-4 px-6 flex justify-between items-center">
        <button type="button" onClick={() => router.back()} className="text-sm font-medium text-text-muted bg-transparent border-none cursor-pointer">
          ‹ Back
        </button>
        <div className="flex gap-3 items-center">
          {allFoods.length > 1 && (
            <span className="text-xs text-text-muted">
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
