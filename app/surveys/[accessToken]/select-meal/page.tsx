'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSurveyStore } from '@/internal/domain/survey/store/useSurveyStore';
import { Button } from '@/internal/pkg/components/Button';
import { Utensils, Coffee, Croissant } from 'lucide-react';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: <Utensils className="w-6 h-6" /> },
  { id: 'morning_snack', label: 'Morning Snack', icon: <Coffee className="w-6 h-6" /> },
  { id: 'lunch', label: 'Lunch', icon: <Utensils className="w-6 h-6" /> },
  { id: 'afternoon_snack', label: 'Afternoon Snack', icon: <Croissant className="w-6 h-6" /> },
  { id: 'dinner', label: 'Dinner', icon: <Utensils className="w-6 h-6" /> },
  { id: 'evening_snack', label: 'Evening Snack', icon: <Coffee className="w-6 h-6" /> },
];

export default function SelectMealPage({ params }: { params: { accessToken: string } }) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('breakfast');
  
  return (
    <div className="p-10 max-w-5xl mx-auto flex flex-col h-full min-h-[80vh]">
      
      {/* Progress Bar Header */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-xs font-bold text-primary tracking-widest uppercase">Progress</span>
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[20%]" />
        </div>
        <span className="text-xs text-gray-500 font-medium">20% Complete</span>
      </div>

      <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Select Meal Time</h1>
      <p className="text-gray-500 mb-10">Please identify which meal you are recording and the specific time it occurred.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        {/* Select Meal Type */}
        <div className="border border-border rounded-2xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2 font-bold text-gray-700 mb-6">
            <Utensils className="w-5 h-5 text-gray-400" /> Select Meal Type
          </div>
          <div className="grid grid-cols-2 gap-4">
            {MEAL_TYPES.map(type => (
              <div 
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedType === type.id 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border text-gray-500 hover:border-gray-300'
                }`}
              >
                <div className={`mb-2 ${selectedType === type.id ? 'text-primary' : 'text-gray-400'}`}>
                  {type.icon}
                </div>
                <span className="font-medium text-sm">{type.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Specific Time */}
        <div className="flex flex-col gap-6">
          <div className="border border-border rounded-2xl p-6 bg-white shadow-sm flex-1 flex flex-col">
            <div className="flex items-center gap-2 font-bold text-gray-700 mb-6">
              <ClockIcon /> Specific Time
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Digital Clock Mockup */}
              <div className="flex items-center gap-4 text-5xl font-display font-bold text-primary mb-6">
                <div className="flex flex-col items-center">
                  <span className="text-gray-300 cursor-pointer">^</span>
                  <span>07</span>
                  <span className="text-gray-300 cursor-pointer">v</span>
                </div>
                <span>:</span>
                <div className="flex flex-col items-center">
                  <span className="text-gray-300 cursor-pointer">^</span>
                  <span>00</span>
                  <span className="text-gray-300 cursor-pointer">v</span>
                </div>
              </div>
              <div className="flex bg-gray-100 rounded-full p-1">
                <button className="px-4 py-1 rounded-full bg-primary text-white font-medium text-sm shadow-sm">AM</button>
                <button className="px-4 py-1 rounded-full text-gray-500 font-medium text-sm">PM</button>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex gap-3 items-start">
            <div className="text-primary mt-0.5">ℹ️</div>
            <p className="text-primary text-sm font-medium">
              Accurately recording your meal times helps us analyze your body's metabolic rhythm with greater precision.
            </p>
          </div>
        </div>

      </div>

      {/* Banner */}
      <div className="mt-auto bg-gradient-to-r from-primary to-emerald-700 rounded-2xl p-8 text-white flex justify-between items-center overflow-hidden relative">
        <div className="relative z-10 max-w-md">
          <h2 className="text-2xl font-bold mb-2">Guided Nutrition</h2>
          <p className="text-white/80 text-sm">Each step in this survey has been designed by professional nutritionists to provide personalized recommendations.</p>
        </div>
      </div>

      <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-border p-4 flex justify-between items-center px-10">
        <button className="text-gray-500 font-medium hover:text-gray-900">&lt; Back</button>
        <Button onClick={() => router.push(`/surveys/${params.accessToken}/add-food`)}>
          Continue &gt;
        </Button>
      </div>

    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}
