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
    <div className="flex items-center gap-4">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-[0.08em] shrink-0">{label}</span>
      <div className="progress flex-1"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
      <span className="text-xs font-medium text-text-muted shrink-0">{pct}% Complete</span>
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
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[820px] mx-auto p-8 px-6 flex flex-col gap-6">

          <ProgressBar label="Progress" pct={40} />

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2 mt-0">
              What did you have for Breakfast?
            </h1>
            <p className="text-sm text-text-muted m-0">
              Search and add everything you consumed this morning.
            </p>
          </div>

          {/* Info banner */}
          <div className="alert alert-primary">
            <Info size={16} className="shrink-0" />
            <span className="text-xs leading-relaxed">
              Please record each food component separately (for example, if you had Fried Rice, also enter any toppings or side items such as egg, crackers, cucumber, etc.) to ensure more accurate nutrition calculations.
            </span>
          </div>

          {/* Search blocks */}
          {[
            { label: 'ADD FOODS', icon: <Search size={16} />, query: foodQuery, setQuery: setFoodQuery, results: foodResults, field: 'food' as const, placeholder: 'Search foods (e.g. Bubur Ayam)' },
            { label: 'ADD DRINKS', icon: <span className="text-base">🥤</span>, query: drinkQuery, setQuery: setDrinkQuery, results: drinkResults, field: 'drink' as const, placeholder: 'Search drinks (e.g. Kopi Susu)' },
          ].map(({ label, icon, query, setQuery, results, field, placeholder }) => (
            <div key={field} className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</span>
              <div className="flex gap-2 relative" ref={field === 'food' ? undefined : undefined}>
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted flex pointer-events-none">
                    {icon}
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocusedField(field)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-sans text-text-primary bg-surface border-[1.5px] border-border rounded-lg outline-none transition-base box-border focus:border-primary focus:shadow-focus"
                    onBlur={() => { setTimeout(() => setFocusedField(null), 150); }}
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
                  className="px-5 rounded-lg bg-primary border-none text-white text-sm font-bold cursor-pointer transition-base font-sans shrink-0 hover:bg-primary-hover"
                >
                  ADD
                </button>
              </div>
            </div>
          ))}

          {/* Browse by Category */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-text-primary m-0">
                Browse by Category
              </h3>
              <button type="button" className="text-sm font-semibold text-primary bg-transparent border-none cursor-pointer">
                Show All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-[1.5px] border-border bg-surface cursor-pointer transition-base font-sans text-center hover:border-primary-border hover:bg-primary-light hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center text-xl">
                    {CATEGORY_ICONS[cat] || '🍽️'}
                  </div>
                  <span className="text-xs font-medium text-text-secondary">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Added Items */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="flex justify-between items-center py-3 px-4 bg-surface-alt border-b border-border">
              <span className="text-sm font-semibold text-text-secondary">Added Items</span>
              <span className="badge badge-default">{activeMeal?.foods.length || 0} items</span>
            </div>
            <div className="py-3 px-4 bg-primary-light border-b border-primary-border flex gap-2 items-start">
              <Info size={14} className="text-primary shrink-0 mt-px" />
              <span className="text-xs text-primary">
                Portion sizes and specific ingredients for these items will be adjusted in the next step.
              </span>
            </div>
            {activeMeal && activeMeal.foods.length > 0 ? (
              <div>
                {activeMeal.foods.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 py-3 px-4 border-b border-border">
                    <div className="w-8 h-8 rounded-md bg-primary-light flex items-center justify-center text-base shrink-0">🍛</div>
                    <span className="flex-1 text-sm font-medium text-text-primary">{f.name}</span>
                    <button
                      type="button"
                      className="bg-transparent border-none cursor-pointer text-text-muted flex p-1 rounded-sm transition-fast hover:text-danger hover:bg-danger-light"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-text-muted text-sm">
                No items added yet
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-surface border-t border-border py-4 px-6 flex justify-between items-center">
        <button type="button" onClick={() => router.back()} className="text-sm font-medium text-text-muted bg-transparent border-none cursor-pointer">
          ‹ Back
        </button>
        <Button onClick={() => router.push(`/surveys/${params.accessToken}/portion`)}>
          Continue ›
        </Button>
      </div>
    </div>
  );
}
