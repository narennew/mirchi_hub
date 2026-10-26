'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  MapPin,
  Clock,
  Search,
  ShieldCheck,
  Phone,
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  const { itemCount, finalAmount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[#FFDE00] border-b-2 border-red-600 shadow-md">
      {/* Top bar: Contact Numbers & Location */}
      <div className="bg-[#261014] px-4 py-1.5 text-xs text-white font-bold">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-yellow-400">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>Vysial Street, Town Hall, Coimbatore</span>
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-200">
              <Clock className="w-3 h-3 text-yellow-400" />
              <span>Open Daily: 3:00 PM – 10:30 PM</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-yellow-400 font-extrabold text-[11px] sm:text-xs">
              <Phone className="w-3.5 h-3.5 text-red-500" />
              <span>Call / Order: 9994147744 / 9597400881</span>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-0.5 rounded text-[11px] font-black transition"
            >
              <ShieldCheck className="w-3 h-3 text-yellow-300" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Brand logo & title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-white p-0.5 shadow-md border-2 border-red-600 group-hover:scale-105 transition shrink-0">
            <Image
              src="/images/logo.png"
              alt="Mirchi Chaats Official Logo"
              fill
              priority
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-2xl sm:text-3xl tracking-tight text-[#261014]">
                MIRCHI
              </span>
              <span className="font-black text-2xl sm:text-3xl tracking-tight text-red-600">
                CHAATS
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#261014] font-bold mt-1">
              <span className="text-red-700">Taste That Hits Different</span>
              <span className="text-black/40">•</span>
              <span className="text-black/80">Coimbatore</span>
            </div>
          </div>
        </Link>

        {/* Center: Search input */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <Search className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Masala Puri, Bhel, Pav Bhaji, Dahi Puri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-sm rounded-full pl-10 pr-4 py-2 text-[#261014] placeholder:text-slate-500 border-2 border-red-500/40 focus:outline-none focus:border-red-600 shadow-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-600 font-bold hover:text-red-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right side controls: (Takeaway hidden) & Cart button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart button in Red with Yellow badge */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-red-700/30 border-2 border-yellow-300 transition group active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 group-hover:rotate-6 transition transform" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-300 text-black font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="text-left hidden xs:block">
              <span className="block text-[10px] text-yellow-200 font-bold leading-none">
                {itemCount} {itemCount === 1 ? 'dish' : 'dishes'}
              </span>
              <span className="font-black text-xs sm:text-sm leading-tight text-white">
                ₹{finalAmount}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Masala Puri, Bhel, Pav Bhaji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-sm rounded-full pl-10 pr-4 py-2 text-[#261014] placeholder:text-slate-500 border-2 border-red-500/40 focus:outline-none focus:border-red-600 shadow-sm"
          />
        </div>
      </div>
    </header>
  );
}
