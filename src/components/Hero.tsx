'use client';

import React from 'react';
import Image from 'next/image';
import { Flame, Sparkles, Shield, Clock, Phone } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onTrackClick: () => void;
}

export function Hero({ onExploreClick, onTrackClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF080] via-[#FFF9D6] to-[#FFF9E6] border-b-2 border-yellow-400 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left column: Brand Headline and Tagline */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600 text-white text-xs font-black tracking-wider uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Taste That Hits Different • Unlimited Taste</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[#261014]">
              Hot, Tangy &amp; Crunchy <br />
              <span className="text-red-600 drop-shadow-sm">Vysial Street Chaats</span>
            </h1>

            <p className="text-[#3b2126] text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold">
              Authentic Coimbatore street-side chaats on Vysial Street, Town Hall.
              From piping hot <strong className="text-red-700">Masala Puri</strong> and crunchy{' '}
              <strong className="text-red-700">Bhel</strong> to buttery{' '}
              <strong className="text-red-700">Cheese Pav Bhaji</strong> and chilled{' '}
              <strong className="text-red-700">Dahi Puri</strong>.
            </p>

            {/* Direct ordering advantages in white cards with red/yellow borders */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto lg:mx-0 pt-1 text-left">
              <div className="flex items-center gap-2 bg-white border-2 border-yellow-400 rounded-xl p-2.5 shadow-sm">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-black text-[#261014]">Direct Menu Prices</div>
                  <div className="text-[10px] text-red-600 font-bold">Zero Commissions</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white border-2 border-yellow-400 rounded-xl p-2.5 shadow-sm">
                <Clock className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <div className="text-xs font-black text-[#261014]">Hot &amp; Fresh</div>
                  <div className="text-[10px] text-slate-700 font-bold">Piping Hot Tawa Prep</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white border-2 border-red-500 rounded-xl p-2.5 col-span-2 sm:col-span-1 shadow-sm">
                <Phone className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <div className="text-xs font-black text-[#261014]">Direct Hotline</div>
                  <div className="text-[10px] text-red-700 font-black">9994147744 / 9597400881</div>
                </div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={onExploreClick}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-red-600/30 border-2 border-yellow-300 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Flame className="w-4 h-4 text-yellow-300" />
                <span>Explore Full Menu</span>
              </button>

              <button
                type="button"
                onClick={onTrackClick}
                className="flex items-center gap-2 bg-white hover:bg-yellow-50 text-[#261014] font-black text-sm px-6 py-3.5 rounded-xl shadow-md border-2 border-red-600 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Track Your Order</span>
              </button>
            </div>
          </div>

          {/* Right column: Story of Girish Kumar & Signature Dishes Poster */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-yellow-900/30 border-4 border-white group">
              <Image
                src="/images/story-poster.png"
                alt="Mirchi Chaats - The Story of Girish Kumar & Signature Dishes Since 1980"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover group-hover:scale-[1.02] transition duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
