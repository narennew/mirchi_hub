'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { calculateCartItemSubtotal } from '@/lib/pricing';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export function CartDrawer({ onProceedToCheckout }: CartDrawerProps) {
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    deliveryFee,
    taxAmount,
    finalAmount,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  // Free delivery threshold progress (free above ₹399)
  const freeThreshold = 399;
  const amountNeededForFree = Math.max(0, freeThreshold - subtotal);
  const freePercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-l-4 border-yellow-400 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b-2 border-yellow-400 flex items-center justify-between bg-[#FFDE00]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-sm">
              <ShoppingBag className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#261014]">Your Chaat Cart</h2>
              <span className="text-xs text-red-700 font-extrabold">
                {itemCount} {itemCount === 1 ? 'dish' : 'dishes'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-[#261014] hover:text-red-700 font-bold px-2 py-1 transition"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white text-[#261014] hover:text-black flex items-center justify-center transition border-2 border-red-600 shadow-sm"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-[#FFFDF5]">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-yellow-400 flex items-center justify-center text-red-500 shadow-sm">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-lg text-[#261014]">Your cart is empty</h3>
              <p className="text-xs text-slate-600 max-w-xs font-medium">
                Treat yourself to authentic Coimbatore Masala Puri, crunchy Bhel, and buttery Cheese Pav Bhaji!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-red-600/30 border-2 border-yellow-300"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable items and order details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-[#FFFDF5]">
              {/* Free delivery threshold indicator */}
              <div className="bg-[#FFF8D6] border-2 border-yellow-400 rounded-2xl p-3 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="flex items-center gap-1 text-[#261014]">
                    <Sparkles className="w-3.5 h-3.5 text-red-600" />
                    {amountNeededForFree > 0
                      ? `Add ₹${amountNeededForFree} more for FREE Delivery`
                      : '🎉 Congratulations! You unlocked FREE Delivery'}
                  </span>
                  <span className="text-red-600 text-[11px] font-black">
                    {freePercent}%
                  </span>
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-red-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${freePercent}%` }}
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2.5">
                {items.map((item) => {
                  const lineTotal = calculateCartItemSubtotal(item);
                  return (
                    <div
                      key={item.id}
                      className="bg-white border-2 border-yellow-300 rounded-2xl p-3 flex items-start justify-between gap-3 shadow-sm"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#261014]">
                            {item.name}
                          </span>
                        </div>

                        {/* Customizations tags (Spice hidden from UI) */}
                        {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 text-[11px]">
                            {item.selectedCustomizations.map((c) => (
                              <span
                                key={c.id}
                                className="bg-yellow-100 text-red-700 px-1.5 py-0.5 rounded-md font-bold border border-yellow-300"
                              >
                                +{c.name} (₹{c.price})
                              </span>
                            ))}
                          </div>
                        )}

                        {item.notes && (
                          <div className="text-[11px] text-red-600 font-bold italic">
                            &quot;{item.notes}&quot;
                          </div>
                        )}

                        <div className="text-sm font-black text-red-600 pt-0.5">
                          ₹{lineTotal}
                        </div>
                      </div>

                      {/* Steppers in Red */}
                      <div className="flex items-center gap-1 bg-red-600 rounded-xl p-0.5 border-2 border-yellow-300 shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-red-700 hover:bg-red-800 flex items-center justify-center text-white transition"
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="w-3 h-3 text-white" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                        </button>
                        <span className="w-5 text-center text-xs font-black text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-red-700 hover:bg-red-800 flex items-center justify-center text-white transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bill Details Breakdown */}
              <div className="bg-white border-2 border-yellow-300 rounded-2xl p-3.5 space-y-2 text-xs shadow-sm">
                <div className="font-black text-[#261014] border-b border-yellow-200 pb-1.5 uppercase tracking-wider text-[11px]">
                  Bill Summary
                </div>

                <div className="flex justify-between text-slate-700 font-bold">
                  <span>Item Subtotal</span>
                  <span className="text-[#261014]">₹{subtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-black">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-700 font-bold">
                  <span>Delivery Charge</span>
                  <span className="text-[#261014]">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-black uppercase">
                        FREE
                      </span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-700 font-bold">
                  <span>Restaurant GST (5%)</span>
                  <span className="text-[#261014]">₹{taxAmount}</span>
                </div>

                <div className="flex justify-between font-black text-sm text-[#261014] pt-2 border-t-2 border-yellow-200">
                  <span>To Pay</span>
                  <span className="text-red-600 text-xl font-black">₹{finalAmount}</span>
                </div>
              </div>
            </div>

            {/* Footer with checkout action in Red */}
            <div className="p-4 border-t-2 border-yellow-400 bg-[#FFDE00] space-y-2">
              <button
                type="button"
                onClick={onProceedToCheckout}
                className="w-full flex items-center justify-between bg-red-600 hover:bg-red-700 text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-xl shadow-red-700/30 border-2 border-yellow-300 transition active:scale-98"
              >
                <div className="text-left">
                  <div className="text-[10px] text-yellow-200 font-extrabold uppercase tracking-wider leading-none">
                    Total Amount
                  </div>
                  <div className="text-xl font-black leading-tight text-white">
                    ₹{finalAmount}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-black bg-yellow-300 text-[#261014] px-3.5 py-1.5 rounded-lg shadow-sm">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </div>
              </button>

              <div className="text-center text-[10px] text-[#261014] font-black">
                Hot &amp; Fresh Doorstep Delivery from Vysial St, Coimbatore
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
