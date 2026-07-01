'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Select Meal', path: 'select-meal' },
  { id: 2, label: 'Add Food', path: 'add-food' },
  { id: 3, label: 'Estimation Portion', path: 'portion' },
  { id: 4, label: 'Additional details', path: 'additional' },
  { id: 5, label: 'Review', path: 'review' },
  { id: 6, label: 'Result', path: 'result' },
];

export function SurveySidebar({ accessToken }: { accessToken: string }) {
  const pathname = usePathname();
  
  // Find current step index based on pathname
  const currentStepIndex = STEPS.findIndex(s => pathname.includes(s.path));
  
  return (
    <div className="w-64 bg-gray-50 border-r border-border p-6 flex flex-col h-screen fixed left-0 top-0">
      <div className="space-y-6 mt-16">
        {STEPS.map((step, idx) => {
          const isActive = pathname.includes(step.path);
          const isPast = currentStepIndex > idx;
          
          return (
            <Link 
              key={step.id} 
              href={`/surveys/${accessToken}/${step.path}`}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm ${
                isActive ? 'border-primary bg-primary text-white' : 
                isPast ? 'border-primary text-primary' : 'border-gray-300'
              }`}>
                {isPast ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span>{step.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto bg-white p-4 rounded-xl border border-border shadow-sm">
        <h4 className="text-primary font-bold text-sm mb-1">Eat Mindfully</h4>
        <p className="text-xs text-gray-500 leading-tight">
          Make sure to record everything you consume to achieve the most accurate results.
        </p>
      </div>
    </div>
  );
}
