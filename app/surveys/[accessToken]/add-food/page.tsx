'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSurveyStore } from '@/internal/domain/survey/store/useSurveyStore';
import { Button } from '@/internal/pkg/components/Button';
import { Search, Info, X } from 'lucide-react';
import { apiClient as api } from '@/internal/lib/axios';

/* ── Shared wizard helpers (duplicated for page isolation) ── */
function ProgressBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>{label}</span>
      <div className="progress" style={{ flex: 1 }}><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-muted)', flexShrink: 0 }}>{pct}% Complete</span>
    </div>
  );
}

const CATEGORIES = ['Staple Food', 'Animal Protein', 'Plant-Based Protein', 'Vegetables', 'Fruits'];
const CATEGORY_ICONS: Record<string, string> = {
  'Staple Food': '🍚', 'Animal Protein': '🍗', 'Plant-Based Protein': '🫘', 'Vegetables': '🥬', 'Fruits': '🍌',
};

export default function AddFoodPage({ params }: { params: { accessToken: string } }) {
  const router = useRouter();
  const { meals, addFoodToMeal } = useSurveyStore();
  const activeMealId = meals[0]?.id || 'meal-1';

  const [foodQuery, setFoodQuery] = useState('');
  const [drinkQuery, setDrinkQuery] = useState('');
  const [foodResults, setFoodResults] = useState<any[]>([]);
  const [drinkResults, setDrinkResults] = useState<any[]>([]);
  const [focusedField, setFocusedField] = useState<'food' | 'drink' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const search = async (q: string, setter: (r: any[]) => void) => {
    if (q.length > 2) {
      try {
        const res = await api.get(`/public/foods/search?q=${q}`);
        setter(res.data.data.foods || []);
      } catch { setter([]); }
    } else setter([]);
  };

  useEffect(() => { const t = setTimeout(() => search(foodQuery, setFoodResults), 400); return () => clearTimeout(t); }, [foodQuery]);
  useEffect(() => { const t = setTimeout(() => search(drinkQuery, setDrinkResults), 400); return () => clearTimeout(t); }, [drinkQuery]);

  const handleAdd = (food: any) => {
    addFoodToMeal(activeMealId, { foodId: food.id, name: food.name });
    setFoodQuery(''); setDrinkQuery('');
    setFoodResults([]); setDrinkResults([]);
  };

  const activeMeal = meals.find((m) => m.id === activeMealId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: 'var(--space-8) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          <ProgressBar label="Progress" pct={40} />

          {/* Title */}
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-2)' }}>
              What did you have for Breakfast?
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
              Search and add everything you consumed this morning.
            </p>
          </div>

          {/* Info banner */}
          <div className="alert alert-primary">
            <Info size={16} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--text-xs)', lineHeight: 'var(--leading-relaxed)' }}>
              Please record each food component separately (for example, if you had Fried Rice, also enter any toppings or side items such as egg, crackers, cucumber, etc.) to ensure more accurate nutrition calculations.
            </span>
          </div>

          {/* Search blocks */}
          {[
            { label: 'ADD FOODS', icon: <Search size={16} />, query: foodQuery, setQuery: setFoodQuery, results: foodResults, field: 'food' as const, placeholder: 'Search foods (e.g. Bubur Ayam)' },
            { label: 'ADD DRINKS', icon: <span style={{ fontSize: '1rem' }}>🥤</span>, query: drinkQuery, setQuery: setDrinkQuery, results: drinkResults, field: 'drink' as const, placeholder: 'Search drinks (e.g. Kopi Susu)' },
          ].map(({ label, icon, query, setQuery, results, field, placeholder }) => (
            <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>{label}</span>
              <div style={{ display: 'flex', gap: 'var(--space-2)', position: 'relative' }} ref={field === 'food' ? undefined : undefined}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <div style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', pointerEvents: 'none' }}>
                    {icon}
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocusedField(field)}
                    placeholder={placeholder}
                    style={{
                      width: '100%', paddingLeft: '2.5rem', paddingRight: 'var(--space-4)',
                      paddingTop: '0.625rem', paddingBottom: '0.625rem',
                      fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)',
                      color: 'var(--color-text-primary)', backgroundColor: 'var(--color-surface)',
                      border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                      outline: 'none', transition: 'var(--transition-base)', boxSizing: 'border-box',
                    }}
                    onFocus2={(e: any) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'var(--focus-ring)'; }}
                    onBlur={(e) => { setTimeout(() => setFocusedField(null), 150); e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  {/* Dropdown */}
                  {results.length > 0 && focusedField === field && (
                    <div className="search-dropdown">
                      {results.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="search-result-item"
                          onMouseDown={() => handleAdd(item)}
                        >
                          <span className="result-name">{item.name}</span>
                          {item.category?.name && <span className="result-category">{item.category.name}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  style={{
                    padding: '0 var(--space-5)', borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-primary)', border: 'none',
                    color: 'white', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)',
                    cursor: 'pointer', transition: 'var(--transition-base)', fontFamily: 'var(--font-sans)',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
                >
                  ADD
                </button>
              </div>
            </div>
          ))}

          {/* Browse by Category */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', margin: 0 }}>
                Browse by Category
              </h3>
              <button type="button" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Show All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5" style={{ gap: 'var(--space-3)' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)',
                    border: '1.5px solid var(--color-border)', backgroundColor: 'var(--color-surface)',
                    cursor: 'pointer', transition: 'var(--transition-base)', fontFamily: 'var(--font-sans)',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-border)'; e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'var(--color-surface)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    {CATEGORY_ICONS[cat] || '🍽️'}
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-secondary)' }}>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Added Items */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)' }}>Added Items</span>
              <span className="badge badge-default">{activeMeal?.foods.length || 0} items</span>
            </div>
            <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-primary-light)', borderBottom: '1px solid var(--color-primary-border)', display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
              <Info size={14} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
                Portion sizes and specific ingredients for these items will be adjusted in the next step.
              </span>
            </div>
            {activeMeal && activeMeal.foods.length > 0 ? (
              <div>
                {activeMeal.foods.map((f) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🍛</div>
                    <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>{f.name}</span>
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 4, borderRadius: 'var(--radius-sm)', transition: 'var(--transition-fast)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.backgroundColor = 'var(--color-danger-light)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                No items added yet
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={() => router.back()} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ‹ Back
        </button>
        <Button onClick={() => router.push(`/surveys/${params.accessToken}/portion`)}>
          Continue ›
        </Button>
      </div>
    </div>
  );
}
