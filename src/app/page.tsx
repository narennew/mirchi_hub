'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CategoryNav } from '@/components/CategoryNav';
import { FoodCard } from '@/components/FoodCard';
import { CustomizeModal } from '@/components/CustomizeModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { BottomCartBar } from '@/components/BottomCartBar';
import { CartProvider } from '@/context/CartContext';
import { Category, MenuItem } from '@/types';
import {
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Search,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

function StorefrontContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');

  // Modals state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const menuSectionRef = useRef<HTMLDivElement>(null);

  // Fetch menu data from API
  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories);
          setItems(data.items);
        }
      } catch (err) {
        console.error('Failed to load menu catalogue:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const scrollToMenu = () => {
    menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter items based on Category and Search Query (Spice filter hidden)
  const filteredItems = items.filter((item) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // Category filter
    if (selectedCategorySlug !== 'all') {
      const cat = categories.find((c) => c.slug === selectedCategorySlug);
      if (cat && item.categoryId !== cat.id) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#FFF9E6] flex flex-col selection:bg-red-600 selection:text-white text-[#221014]">
      {/* Top Header with Brand Logo */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Hero Section */}
      <Hero
        onExploreClick={scrollToMenu}
        onTrackClick={() => {
          const orderNum = prompt('Enter your Order Number (e.g. MC-2026-1001):');
          if (orderNum) {
            window.location.href = `/order/${orderNum.trim()}`;
          }
        }}
      />

      {/* Sticky Category Navigation */}
      <div ref={menuSectionRef}>
        <CategoryNav
          categories={categories}
          selectedCategorySlug={selectedCategorySlug}
          onSelectCategory={(slug) => {
            setSelectedCategorySlug(slug);
            setSearchQuery('');
          }}
        />
      </div>

      {/* Main Dishes Catalog Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Active category / search heading */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-yellow-400 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#261014] flex items-center gap-2">
              <span>
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : selectedCategorySlug === 'all'
                  ? 'Official Menu Card'
                  : categories.find((c) => c.slug === selectedCategorySlug)?.name || 'Menu'}
              </span>
              <span className="text-xs font-black text-white bg-red-600 px-3 py-0.5 rounded-full border border-yellow-400">
                {filteredItems.length} dishes
              </span>
            </h2>
            <p className="text-xs text-red-700 font-black mt-0.5 tracking-wide">
              • TASTE THAT HITS DIFFERENT • Vysial Street, Town Hall, Coimbatore
            </p>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white border-2 border-yellow-300 rounded-2xl p-5 animate-pulse space-y-3"
              >
                <div className="h-5 bg-yellow-200 rounded w-3/4" />
                <div className="h-3 bg-yellow-100 rounded w-full" />
                <div className="h-3 bg-yellow-100 rounded w-2/3" />
                <div className="h-8 bg-yellow-200 rounded w-1/3 pt-2" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty Search or Filter */
          <div className="bg-white border-4 border-yellow-400 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-12 shadow-md">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-red-600 mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-lg text-[#261014]">No dishes found</h3>
              <p className="text-xs text-slate-600 font-medium">
                We couldn&apos;t find any item matching &quot;{searchQuery}&quot;.
                Try adjusting your search terms.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategorySlug('all');
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition border-2 border-yellow-300 shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Food Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredItems.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                onCustomize={(selectedItem) => setCustomizingItem(selectedItem)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar for Mobile */}
      <BottomCartBar />

      {/* Customize Add-ons Modal (Spice hidden) */}
      <CustomizeModal
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
      />

      {/* Persistent / Sliding Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Footer styled with Yellow, Red & White brand artwork */}
      <footer className="mt-16 border-t-4 border-yellow-400 bg-[#261014] text-slate-200 text-xs py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white p-0.5 border-2 border-yellow-400 shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Mirchi Chaats Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-black text-xl text-white">MIRCHI </span>
                <span className="font-black text-xl text-red-500">CHAATS</span>
                <div className="text-[10px] text-yellow-400 font-extrabold uppercase tracking-wider">
                  Taste That Hits Different
                </div>
              </div>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed font-medium">
              Coimbatore&apos;s evening chaat addiction on Vysial Street, Town Hall.
              Fresh puris, steaming hot ragda, butter pav bhaji and handcrafted street snacks.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>100% Pure Vegetarian Kitchen</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-black text-yellow-400 uppercase tracking-wider text-[11px]">
              Location &amp; Timings
            </div>
            <div className="flex items-start gap-2 text-slate-200">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>Vysial Street, Town Hall, Coimbatore, Tamil Nadu 641001</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>3:00 PM – 10:30 PM (Daily)</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400 font-black">
              <Phone className="w-4 h-4 text-red-500 shrink-0" />
              <span>9994147744 / 9597400881</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-black text-yellow-400 uppercase tracking-wider text-[11px]">
              Direct Order Advantage
            </div>
            <ul className="space-y-1.5 text-slate-200 font-medium">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Original menu card prices (zero markup)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Piping hot tawa preparation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exclusive promo codes: WELCOME50, CHAAT20</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Customisable add-ons &amp; dietary notes</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-black text-yellow-400 uppercase tracking-wider text-[11px]">
              Store Administration
            </div>
            <p className="text-xs text-slate-300">
              Staff portal for live orders, kitchen status updates, and transport management.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2 rounded-xl border-2 border-yellow-400 transition shadow-md shadow-red-600/30"
            >
              <ShieldCheck className="w-4 h-4 text-yellow-300" />
              <span>Admin Management</span>
            </Link>
          </div>
        </div>

        {/* Menu card footer tagline */}
        <div className="max-w-7xl mx-auto pt-6 mt-8 border-t border-white/15 text-center">
          <div className="inline-block bg-yellow-400 text-[#261014] font-black text-xs px-5 py-1.5 rounded-full tracking-widest uppercase mb-3 shadow">
            ★ GOOD FOOD • GOOD MOOD • EVERY TIME ★
          </div>
          <div className="text-slate-400 text-[11px] flex flex-wrap items-center justify-between gap-2">
            <div>
              © 2026 Mirchi Chaats, Coimbatore. All rights reserved.
            </div>
            <div>
              Vysial Street, Town Hall • Helpline: 9994147744 / 9597400881
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <CartProvider>
      <StorefrontContent />
    </CartProvider>
  );
}
