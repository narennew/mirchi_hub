'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ChevronRight } from 'lucide-react';

export function BottomCartBar() {
  const { itemCount, finalAmount, setIsCartOpen } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 animate-in slide-in-from-bottom duration-300">
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="w-full bg-gradient-to-r from-red-600 via-red-700 to-amber-600 text-white rounded-2xl p-3.5 shadow-2xl shadow-red-950/80 border-2 border-yellow-400 flex items-center justify-between active:scale-98 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center font-bold text-sm relative border border-yellow-400/30">
            <ShoppingBag className="w-5 h-5 text-yellow-300" />
            <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-black shadow">
              {itemCount}
            </span>
          </div>
          <div className="text-left">
            <div className="text-xs text-yellow-200 font-semibold">
              {itemCount} {itemCount === 1 ? 'Chaat Dish' : 'Chaat Dishes'}
            </div>
            <div className="text-lg font-black leading-tight text-white">
              ₹{finalAmount}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-black bg-yellow-400 text-black px-4 py-2 rounded-xl transition shadow">
          <span>View Cart</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </div>
      </button>
    </div>
  );
}
