'use client';

import React from 'react';
import { Category } from '@/types';
import {
  UtensilsCrossed,
  Sparkles,
  Layers,
  Cookie,
  GlassWater,
  Flame,
  CheckCircle,
} from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategorySlug: string;
  onSelectCategory: (slug: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'chaat-puri': <UtensilsCrossed className="w-4 h-4" />,
  bhel: <Sparkles className="w-4 h-4" />,
  'dahi-items': <Sparkles className="w-4 h-4" />,
  'cheese-items': <Layers className="w-4 h-4" />,
  snacks: <Cookie className="w-4 h-4" />,
  beverages: <GlassWater className="w-4 h-4" />,
  sweets: <Flame className="w-4 h-4" />,
};

export function CategoryNav({
  categories,
  selectedCategorySlug,
  onSelectCategory,
}: CategoryNavProps) {
  return (
    <div className="sticky top-[108px] sm:top-[74px] z-30 bg-[#FFFBEA]/95 backdrop-blur-md border-b-2 border-yellow-400 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Horizontal scrollable category pill row */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {/* "All Dishes" option */}
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition shrink-0 ${
              selectedCategorySlug === 'all'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 border-2 border-yellow-300'
                : 'bg-white hover:bg-yellow-100 text-[#261014] border-2 border-yellow-400 shadow-sm'
            }`}
          >
            <span>All Dishes</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition shrink-0 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30 border-2 border-yellow-300'
                    : 'bg-white hover:bg-yellow-100 text-[#261014] border-2 border-yellow-400 shadow-sm'
                }`}
              >
                {CATEGORY_ICONS[cat.slug] || <CheckCircle className="w-3.5 h-3.5" />}
                <span>{cat.name}</span>
                {cat.itemCount !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected
                        ? 'bg-yellow-300 text-black'
                        : 'bg-yellow-200 text-red-700'
                    }`}
                  >
                    {cat.itemCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
