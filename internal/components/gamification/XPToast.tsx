"use client";

import React, { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

// Bisa di-call dari mana saja dengan emit event custom atau 
// cukup sediakan function helper
export const showXPToast = (xp: number, activityDesc: string) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-500">
              <span className="text-green-600 font-bold text-lg">+{xp}</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-gray-900">
              XP Bertambah!
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {activityDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  ), { duration: 4000, position: "top-center" });
};

export const XPToastContainer: React.FC = () => {
  return <Toaster />;
};
