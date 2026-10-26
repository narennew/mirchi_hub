'use client';

import React from 'react';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus } from 'lucide-react';

interface FoodCardProps {
  item: MenuItem;
  onCustomize: (item: MenuItem) => void;
}

export function FoodCard({ item, onCustomize }: FoodCardProps) {
  const { items, addToCart, updateQuantity } = useCart();

  // Find all cart entries for this menuItemId
  const cartEntries = items.filter((ci) => ci.menuItemId === item.id);
  const totalInCart = cartEntries.reduce((sum, ci) => sum + ci.quantity, 0);

  const handleQuickAdd = () => {
    if (item.availableCustomizations && item.availableCustomizations.length > 0) {
      onCustomize(item);
    } else {
      addToCart(item, item.spiceLevel);
    }
  };

  const handleIncrement = () => {
    if (cartEntries.length === 1) {
      updateQuantity(cartEntries[0].id, 1);
    } else {
      onCustomize(item);
    }
  };

  const handleDecrement = () => {
    if (cartEntries.length > 0) {
      updateQuantity(cartEntries[cartEntries.length - 1].id, -1);
    }
  };

  return (
    <div
      className={`mirchi-card p-4 sm:p-5 flex flex-col justify-between relative group ${
        !item.isAvailable ? 'opacity-60 grayscale-[30%]' : ''
      }`}
    >
      <div className="space-y-2">
        {/* Top: Veg Symbol & Category */}
        <div className="flex items-center justify-between gap-2">
          {/* Pure Veg square indicator */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border-2 border-emerald-600 bg-white flex items-center justify-center p-0.5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
              {item.category}
            </span>
          </div>

          {!item.isAvailable && (
            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full border border-red-300">
              Sold Out Today
            </span>
          )}
        </div>

        {/* Dish Title */}
        <h3 className="font-black text-lg sm:text-xl text-[#261014] group-hover:text-red-600 transition leading-snug">
          {item.name}
        </h3>

        {/* Dish Description */}
        <p className="text-xs text-[#4b353a] font-medium leading-relaxed line-clamp-3">
          {item.description}
        </p>
      </div>

      {/* Bottom price and Add to Cart action */}
      <div className="pt-4 mt-3 border-t border-yellow-300/80 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block leading-none mb-0.5">
            Price
          </span>
          <div className="text-xl sm:text-2xl font-black text-red-600">
            ₹{item.price}
          </div>
        </div>

        <div className="text-right">
          {!item.isAvailable ? (
            <button
              disabled
              className="text-xs text-slate-400 font-bold px-3 py-1.5 rounded-xl border border-slate-300 cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : totalInCart > 0 ? (
            <div className="flex items-center gap-1.5 bg-red-600 rounded-xl p-1 shadow-md shadow-red-600/30 border border-yellow-400">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-7 rounded-lg bg-red-700 hover:bg-red-800 flex items-center justify-center text-white transition active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-black text-white">
                {totalInCart}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 rounded-lg bg-red-700 hover:bg-red-800 flex items-center justify-center text-white transition active:scale-90"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-red-600/30 border-2 border-yellow-300 transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-yellow-300 stroke-[3]" />
              <span>ADD</span>
            </button>
          )}

          {item.availableCustomizations && item.availableCustomizations.length > 0 && (
            <button
              type="button"
              onClick={() => onCustomize(item)}
              className="block text-[10px] text-red-600 hover:text-red-800 font-extrabold mt-1"
            >
              Customisable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
