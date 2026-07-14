'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSurveyStore } from '@/internal/domain/survey/store/useSurveyStore';
import { Button } from '@/internal/pkg/components/Button';
import { apiClient as api } from '@/internal/lib/axios';
import { Utensils, Pencil, Plus, AlertCircle } from 'lucide-react';

function ProgressBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>{label}</span>
      <div className="progress" style={{ flex: 1 }}><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-muted)', flexShrink: 0 }}>{pct}% Complete</span>
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: 'var(--space-8) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          <ProgressBar label="Final Step" pct={100} />

          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-2)' }}>
              Review your meal
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              A detailed breakdown of your meal's nutritional content based on Clinical Vitality standards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 'var(--space-5)', alignItems: 'start' }}>

            {/* Meal items card — col-span 2 */}
            <div className="card" style={{ gridColumn: 'span 2 / span 2' }}>
              <div className="card-header">
                <Utensils size={18} style={{ color: 'var(--color-primary)' }} />
                <h2 style={{ flex: 1, fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', margin: 0 }}>
                  Meal Items
                </h2>
                <button
                  type="button"
                  onClick={() => router.push(`/surveys/${params.accessToken}/add-food`)}
                  style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Edit List
                </button>
              </div>

              {/* Food list */}
              <div>
                {allFoods.length === 0 && (
                  <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                    No foods added yet.
                  </div>
                )}
                {allFoods.map((food, idx) => (
                  <div
                    key={idx}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                      🍛
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {food.name}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                        with standard prep
                      </p>
                    </div>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                      {food.portionLabel || (food.portionGram ? `${food.portionGram}g` : '—')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Adds on section */}
              <div style={{ padding: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-4)' }}>
                  + Adds on
                </h3>
                <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
                  <input
                    type="text"
                    placeholder="Search adds on (e.g. Sugar, Salt, Onion)…"
                    value={addsOnSearch}
                    onChange={(e) => setAddsOnSearch(e.target.value)}
                    style={{
                      width: '100%', padding: '0.625rem var(--space-3)',
                      fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)',
                      color: 'var(--color-text-primary)', backgroundColor: 'var(--color-surface)',
                      border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                      outline: 'none', transition: 'var(--transition-base)', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'var(--focus-ring)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
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
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--weight-semibold)' }}>+ Add</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Addon tags */}
                <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 'var(--space-3)' }}>
                  {(addedAddsOn.length > 0 ? addedAddsOn : [
                    { name: 'Onion', portion: '3g' }, { name: 'Sugar', portion: '12g' },
                    { name: 'Salt',  portion: '84mg' }, { name: 'Water', portion: '210ml' },
                  ]).map((item, i) => (
                    <div
                      key={i}
                      style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{item.name}</span>
                      <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>{item.portion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Quick actions */}
              <div className="card" style={{ padding: 'var(--space-5)' }}>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: '0 0 var(--space-3)' }}>
                  Quick Actions
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
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
                <div className="alert alert-danger" style={{ fontSize: 'var(--text-xs)' }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  {submitError}
                </div>
              )}
              <Button size="lg" className="w-full" onClick={handleSubmit} isLoading={submitting} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Submit Meal Report ▷
              </Button>
              <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                By submitting, you agree to our Clinical Nutritional Data Policy.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)', display: 'flex', justifyContent: 'flex-start' }}>
        <button type="button" onClick={() => router.back()} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ‹ Back
        </button>
      </div>
    </div>
  );
}
