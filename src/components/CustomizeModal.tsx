'use client';

import React, { useState } from 'react';
import { MenuItem, CustomizationOption } from '@/types';
import { useCart } from '@/context/CartContext';
import { X, Check } from 'lucide-react';

interface CustomizeModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function CustomizeModal({ item, onClose }: CustomizeModalProps) {
  const { addToCart } = useCart();
  const [selectedCustomizations, setSelectedCustomizations] = useState<
    CustomizationOption[]
  >([]);
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const toggleCustomization = (option: CustomizationOption) => {
    setSelectedCustomizations((prev) => {
      const exists = prev.some((o) => o.id === option.id);
      if (exists) {
        return prev.filter((o) => o.id !== option.id);
      } else {
        return [...prev, option];
      }
    });
  };

  const addonsTotal = selectedCustomizations.reduce(
    (sum, add) => sum + add.price,
    0
  );
  const finalUnitPrice = item.price + addonsTotal;

  const handleConfirm = () => {
    addToCart(item, item.spiceLevel || 'Medium', selectedCustomizations, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-4 border-yellow-400 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header without placeholder image */}
        <div className="p-5 border-b-2 border-yellow-300 bg-[#FFFBE8] flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-black uppercase text-red-600 tracking-wider">
              {item.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#261014] leading-tight">
              {item.name}
            </h2>
            <div className="text-sm font-black text-red-600 mt-1">
              Base Price: ₹{item.price}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-700 hover:text-black flex items-center justify-center transition border-2 border-yellow-400 shrink-0 shadow-sm"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable customization options */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-sm bg-white">
          {/* Add-ons list */}
          {item.availableCustomizations && item.availableCustomizations.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-black uppercase text-[#261014] tracking-wider">
                Add-ons &amp; Extras (Optional)
              </label>
              <div className="space-y-2">
                {item.availableCustomizations.map((addon) => {
                  const isChecked = selectedCustomizations.some(
                    (o) => o.id === addon.id
                  );
                  return (
                    <label
                      key={addon.id}
                      onClick={() => toggleCustomization(addon)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                        isChecked
                          ? 'border-red-600 bg-red-50 text-[#261014]'
                          : 'border-yellow-300 bg-yellow-50/50 text-[#261014] hover:border-yellow-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                            isChecked
                              ? 'bg-red-600 border-red-600 text-white'
                              : 'border-slate-400 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="font-extrabold text-xs sm:text-sm">
                          {addon.name}
                        </span>
                      </div>
                      <span className="font-black text-xs text-red-600">
                        +₹{addon.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cooking instruction notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase text-[#261014] tracking-wider">
              Special Cooking Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Extra sweet chutney, separate sev, no onions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#FFFBE8] text-xs rounded-xl px-3.5 py-2.5 text-[#261014] border-2 border-yellow-400 focus:outline-none focus:border-red-600 font-medium"
            />
          </div>
        </div>

        {/* Footer with action in Red & Yellow */}
        <div className="p-4 border-t-2 border-yellow-300 bg-[#FFFBE8] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block leading-none">
              Item Total
            </span>
            <div className="text-2xl font-black text-red-600">
              ₹{finalUnitPrice}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 max-w-[220px] flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-lg shadow-red-600/30 border-2 border-yellow-300 transition active:scale-95"
          >
            <span>Add to Order • ₹{finalUnitPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
