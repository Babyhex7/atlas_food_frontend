'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSurveyStore } from '@/internal/domain/survey/store/useSurveyStore';
import { Button } from '@/internal/pkg/components/Button';
import { apiClient as api } from '@/internal/lib/axios';
import { Utensils, Pencil, Plus, AlertCircle } from 'lucide-react';

function ProgressBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-[0.08em] shrink-0">{label}</span>
      <div className="progress flex-1"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
      <span className="text-xs font-medium text-text-muted shrink-0">{pct}% Complete</span>
    </div>
  );
}

export default function ReviewPage({ params }: { params: { accessToken: string } }) {
  const router = useRouter();
  const { meals, token, alias, reset } = useSurveyStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [addsOnSearch, setAddsOnSearch] = useState('');
  const [addsOnResults, setAddsOnResults] = useState<any[]>([]);
  const [addedAddsOn, setAddedAddsOn] = useState<any[]>([]);

  useEffect(() => {
    if (addsOnSearch.length > 2) {
      const t = setTimeout(async () => {
        try {
          const res = await api.get(`/public/foods/search?q=${addsOnSearch}`);
          setAddsOnResults(res.data.data.foods || []);
        } catch { setAddsOnResults([]); }
      }, 400);
      return () => clearTimeout(t);
      // Kosongkan hasil bila query terlalu pendek — sinkron dengan input pencarian.
      // eslint-disable-next-line react-hooks/set-state-in-effect
    } else setAddsOnResults([]);
  }, [addsOnSearch]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/survey/submit', { access_token: token, alias, mealsData: meals, addsOn: addedAddsOn });
      reset();
      router.push(`/surveys/${params.accessToken}/done`);
    } catch (e) {
      setSubmitError('Gagal mengirim laporan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const allFoods = meals.flatMap((m) => m.foods);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto p-8 px-6 flex flex-col gap-6">

          <ProgressBar label="Final Step" pct={100} />

          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2 mt-0">
              Review your meal
            </h1>
            <p className="text-sm text-text-muted m-0">
              A detailed breakdown of your meal&apos;s nutritional content based on Clinical Vitality standards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

            {/* Meal items card — col-span 2 */}
            <div className="card col-span-2">
              <div className="card-header">
                <Utensils size={18} className="text-primary" />
                <h2 className="flex-1 text-base font-semibold text-text-primary m-0">
                  Meal Items
                </h2>
                <button
                  type="button"
                  onClick={() => router.push(`/surveys/${params.accessToken}/add-food`)}
                  className="text-xs font-semibold text-primary bg-transparent border-none cursor-pointer"
                >
                  Edit List
                </button>
              </div>

              {/* Food list */}
              <div>
                {allFoods.length === 0 && (
                  <div className="p-8 text-center text-text-muted text-sm">
                    No foods added yet.
                  </div>
                )}
                {allFoods.map((food, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 py-4 px-5 border-b border-border"
                  >
                    <div className="w-14 h-14 rounded-lg bg-surface-alt border border-border flex items-center justify-center text-2xl shrink-0">
                      🍛
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary mb-0.5 mt-0 overflow-hidden text-ellipsis whitespace-nowrap">
                        {food.name}
                      </p>
                      <p className="text-xs text-text-muted m-0">
                        with standard prep
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-text-secondary shrink-0">
                      {food.portionLabel || (food.portionGram ? `${food.portionGram}g` : '—')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Adds on section */}
              <div className="p-5 border-t border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-4 mt-0">
                  + Adds on
                </h3>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search adds on (e.g. Sugar, Salt, Onion)…"
                    value={addsOnSearch}
                    onChange={(e) => setAddsOnSearch(e.target.value)}
                    className="w-full py-2.5 px-3 text-sm font-sans text-text-primary bg-surface border-[1.5px] border-border rounded-md outline-none transition-base box-border focus:border-primary focus:shadow-focus"
                  />
                  {addsOnResults.length > 0 && (
                    <div className="search-dropdown">
                      {addsOnResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="search-result-item"
                          onMouseDown={() => { setAddedAddsOn((prev) => [...prev, { ...item, portion: '5g' }]); setAddsOnSearch(''); setAddsOnResults([]); }}
                        >
                          <span className="result-name">{item.name}</span>
                          <span className="text-xs text-primary font-semibold">+ Add</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Addon tags */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(addedAddsOn.length > 0 ? addedAddsOn : [
                    { name: 'Onion', portion: '3g' }, { name: 'Sugar', portion: '12g' },
                    { name: 'Salt',  portion: '84mg' }, { name: 'Water', portion: '210ml' },
                  ]).map((item, i) => (
                    <div
                      key={i}
                      className="bg-surface-alt border border-border rounded-lg p-3 flex flex-col gap-0.5"
                    >
                      <span className="text-xs text-text-muted">{item.name}</span>
                      <span className="text-base font-bold text-primary">{item.portion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Quick actions */}
              <div className="card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted mb-3 mt-0">
                  Quick Actions
                </p>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/surveys/${params.accessToken}/portion`)}>
                    <Pencil size={14} /> Edit Portions
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/surveys/${params.accessToken}/select-meal`)}>
                    <Plus size={14} /> Add Meal Time
                  </Button>
                </div>
              </div>

              {/* Submit */}
              {submitError && (
                <div className="alert alert-danger text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  {submitError}
                </div>
              )}
              <Button size="lg" className="w-full uppercase tracking-[0.08em]" onClick={handleSubmit} isLoading={submitting}>
                Submit Meal Report ▷
              </Button>
              <p className="text-center text-xs text-text-muted m-0">
                By submitting, you agree to our Clinical Nutritional Data Policy.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-surface border-t border-border py-4 px-6 flex justify-start">
        <button type="button" onClick={() => router.back()} className="text-sm font-medium text-text-muted bg-transparent border-none cursor-pointer">
          ‹ Back
        </button>
      </div>
    </div>
  );
}
