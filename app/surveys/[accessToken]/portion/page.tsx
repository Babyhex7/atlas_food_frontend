'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSurveyStore } from '@/internal/domain/survey/store/useSurveyStore';
import { Button } from '@/internal/pkg/components/Button';
import { Info } from 'lucide-react';

export default function PortionPage({ params }: { params: { accessToken: string } }) {
  const router = useRouter();
  const { meals, setFoodPortion } = useSurveyStore();
  
  const allFoods = meals.flatMap(m => m.foods.map(f => ({ ...f, mealId: m.id, mealName: m.name })));
  const [currentIndex, setCurrentIndex] = useState(0);

  if (allFoods.length === 0) {
    return (
      <div className="p-10 max-w-5xl mx-auto flex flex-col h-full min-h-[80vh] items-center justify-center">
        <p className="mb-4">No foods added yet.</p>
        <Button onClick={() => router.push(`/surveys/${params.accessToken}/add-food`)}>Back</Button>
      </div>
    );
  }

  const currentFood = allFoods[currentIndex];
  
  const portionOptions = [
    { label: '50g', gram: 50, img: '/placeholder.jpg' },
    { label: '80g', gram: 80, img: '/placeholder.jpg' },
    { label: '110g', gram: 110, img: '/placeholder.jpg' },
    { label: '140g', gram: 140, img: '/placeholder.jpg' },
    { label: '160g', gram: 160, img: '/placeholder.jpg' },
    { label: '200g', gram: 200, img: '/placeholder.jpg' },
    { label: '230g', gram: 230, img: '/placeholder.jpg' },
    { label: '250g', gram: 250, img: '/placeholder.jpg' },
  ];

  const handleSelectPortion = (gram: number, label: string) => {
    setFoodPortion(currentFood.mealId, currentFood.id, gram, label);
  };

  const handleNext = () => {
    if (currentIndex < allFoods.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push(`/surveys/${params.accessToken}/review`);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto flex flex-col h-full min-h-[80vh]">
      
      {/* Progress Bar Header */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-xs font-bold text-primary tracking-widest uppercase">Progress</span>
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[60%]" />
        </div>
        <span className="text-xs text-gray-500 font-medium">60% Complete</span>
      </div>

      <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">How much did you have?</h1>
      <p className="text-gray-500 mb-8">{currentFood.name} ({currentFood.mealName})</p>

      {/* Grid Images Mockup */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {portionOptions.map(opt => (
          <div 
            key={opt.label}
            onClick={() => handleSelectPortion(opt.gram, opt.label)}
            className={`border rounded-2xl overflow-hidden cursor-pointer transition-all ${
              currentFood.portionGram === opt.gram ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-gray-300'
            }`}
          >
            <div className="bg-gray-100 h-32 flex items-center justify-center text-4xl">🍽️</div>
            <div className={`text-center py-3 font-medium text-sm ${currentFood.portionGram === opt.gram ? 'bg-primary/10 text-primary' : 'bg-white'}`}>
              {opt.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center text-primary font-medium px-4 mb-12 cursor-pointer">
        <span>&lt; Previous Food</span>
        <span>Next Food &gt;</span>
      </div>

      {/* Total Weight Badge */}
      <div className="border border-border rounded-2xl p-6 flex flex-col items-center justify-center max-w-xl mx-auto w-full mb-12">
        <span className="text-xs font-bold text-gray-500 mb-4 tracking-widest">TOTAL WEIGHT</span>
        <div className="bg-gray-100 rounded-full px-12 py-3 text-3xl font-display font-bold text-primary">
          {currentFood.portionGram || 0}g
        </div>
      </div>

      <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-border p-4 flex justify-between items-center px-10">
        <button onClick={() => router.back()} className="text-gray-500 font-medium hover:text-gray-900">&lt; Back</button>
        <Button onClick={handleNext} className="px-12 bg-primary">
          I HAD THAT MUCH
        </Button>
      </div>

    </div>
  );
}
