'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSurveyStore } from '@/internal/domain/survey/store/useSurveyStore';
import { Button } from '@/internal/pkg/components/Button';
import { Search, Info, Plus } from 'lucide-react';
import { apiClient as api } from '@/internal/lib/axios';

export default function AddFoodPage({ params }: { params: { accessToken: string } }) {
  const router = useRouter();
  const { meals, addFoodToMeal } = useSurveyStore();
  
  // Since we haven't selected which meal we are adding to, we default to the first one for this UI flow
  // In a real flow, this state would come from Step 1.
  const activeMealId = meals[0]?.id || 'meal-1';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Search API Call
  useEffect(() => {
    if (searchQuery.length > 2) {
      const delayFn = setTimeout(async () => {
        try {
          const res = await api.get(`/public/foods/search?q=${searchQuery}`);
          setSearchResults(res.data.data.foods || []);
        } catch (e) {
          console.error(e);
        }
      }, 500);
      return () => clearTimeout(delayFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleAdd = (food: any) => {
    addFoodToMeal(activeMealId, { foodId: food.id, name: food.name });
    setSearchQuery('');
  };

  const activeMeal = meals.find(m => m.id === activeMealId);

  return (
    <div className="p-10 max-w-5xl mx-auto flex flex-col h-full min-h-[80vh]">
      
      {/* Progress Bar Header */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-xs font-bold text-primary tracking-widest uppercase">Progress</span>
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[40%]" />
        </div>
        <span className="text-xs text-gray-500 font-medium">40% Complete</span>
      </div>

      <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">What did you have for Breakfast?</h1>
      <p className="text-gray-500 mb-6">Search and add everything you consumed this morning.</p>

      <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex gap-3 items-start mb-10">
        <Info className="text-primary w-5 h-5 mt-0.5" />
        <p className="text-primary text-sm font-medium">
          Please record each food component separately (for example, if you had Fried Rice, also enter any toppings or side items such as egg, crackers, cucumber, etc.) to ensure more accurate nutrition calculations.
        </p>
      </div>

      <div className="space-y-6 mb-12">
        {/* Add Foods Search */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Add Foods</label>
          <div className="flex gap-4 relative">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search foods (e.g. Bubur Ayam)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {/* Search Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 hover:bg-gray-50 border-b border-border">
                      <span className="font-medium">{item.name}</span>
                      <Button size="sm" onClick={() => handleAdd(item)}>ADD</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button className="px-8 bg-primary hover:bg-primary-dark">ADD</Button>
          </div>
        </div>
      </div>

      {/* Browse By Category Mockup */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-bold text-gray-800">Browse by Category</label>
          <button className="text-primary text-sm font-bold">Show All</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['Staple Food', 'Animal Protein', 'Plant-Based Protein', 'Vegetables', 'Fruits'].map(cat => (
            <div key={cat} className="border border-border p-4 rounded-2xl flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:border-primary">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl">🍽️</div>
              <span className="text-xs font-medium text-gray-700">{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Added Items */}
      <div className="mt-auto border-t border-border pt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Added Items</h3>
          <span className="bg-gray-200 px-3 py-1 rounded-full text-xs font-bold text-gray-600">{activeMeal?.foods.length || 0} items</span>
        </div>
        
        {activeMeal?.foods.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {activeMeal.foods.map(f => (
              <div key={f.id} className="min-w-[200px] border border-border rounded-xl p-4 flex justify-between items-center bg-white shadow-sm">
                <span className="font-medium">{f.name}</span>
                <Check className="text-green-500 w-5 h-5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-border border-dashed p-4 rounded-xl flex gap-3 items-center text-gray-500 text-sm">
            <Info className="w-4 h-4 text-primary" />
            Portion sizes and specific ingredients for these items will be adjusted in the next step.
          </div>
        )}
      </div>

      <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-border p-4 flex justify-between items-center px-10">
        <button onClick={() => router.back()} className="text-gray-500 font-medium hover:text-gray-900">&lt; Back</button>
        <Button onClick={() => router.push(`/surveys/${params.accessToken}/portion`)}>
          Continue &gt;
        </Button>
      </div>

    </div>
  );
}

function Check(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
