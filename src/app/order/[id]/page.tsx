'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@/types';
import { useCart, CartProvider } from '@/context/CartContext';
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Flame,
  ChefHat,
  Bike,
  Store,
  RefreshCw,
  ArrowLeft,
  RotateCcw,
  Printer,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import { generateOrderWhatsAppMessage, getWhatsAppUrl, MIRCHI_WHATSAPP_NUMBER } from '@/lib/whatsapp';

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  {
    status: 'PLACED',
    label: 'Order Placed',
    desc: 'Sent to Mirchi Chaats kitchen',
  },
  {
    status: 'ACCEPTED',
    label: 'Order Accepted',
    desc: 'Chaat master confirmed receipt',
  },
  {
    status: 'PREPARING',
    label: 'Freshly Preparing',
    desc: 'Simmering ragda & assembling puris',
  },
  {
    status: 'READY_FOR_PICKUP',
    label: 'Packed & Ready',
    desc: 'Sealed fresh in insulated containers',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    desc: 'En route to your address',
  },
  {
    status: 'DELIVERED',
    label: 'Delivered / Collected',
    desc: 'Enjoy your hot chaats!',
  },
];

function OrderTrackingContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const { reorder } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setError(null);
      } else {
        setError(data.error || 'Order not found');
      }
    } catch {
      setError('Failed to fetch latest order status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      // Poll every 12 seconds for real-time kitchen updates
      const interval = setInterval(() => fetchOrder(), 12000);
      return () => clearInterval(interval);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0f17] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">
            Fetching order #{orderId}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0c0f17] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Order Not Found</h2>
            <p className="text-xs text-slate-400">
              We couldn&apos;t locate order reference &quot;{orderId}&quot;. Please verify the order number.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate current status step index
  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'CANCELLED';

  const whatsappMsg = order
    ? generateOrderWhatsAppMessage({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress || 'Vysial Street, Coimbatore',
        pincode: order.pincode || '',
        orderNotes: order.orderNotes,
        items: (order.items || []).map((oi) => ({
          name: oi.productName,
          quantity: oi.quantity,
          subtotal: oi.subtotal,
          selectedCustomizations: oi.customizations,
        })),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        taxAmount: order.taxAmount,
        finalAmount: order.finalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      })
    : '';
  const whatsappUrl = getWhatsAppUrl(whatsappMsg);

  const handlePrint = () => {
    window.print();
  };

  const handleReorder = () => {
    reorder(order);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0c0f17] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-4 py-3 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchOrder(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Status</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Receipt</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Order Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Order Success Hero Banner */}
        <div className="bg-gradient-to-r from-orange-950/60 via-slate-900 to-amber-950/40 border border-orange-500/30 rounded-2xl p-5 sm:p-6 space-y-3 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                    Order #{order.orderNumber}
                  </h1>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {order.paymentMethod === 'ONLINE' ? 'Paid Online' : 'Cash on Delivery'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  {order.orderType === 'DELIVERY' ? 'Doorstep Delivery' : 'Takeaway Pickup'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Notify WhatsApp (+91 9597400881)</span>
              </a>

              <button
                type="button"
                onClick={handleReorder}
                className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reorder Chaats</span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-300 flex flex-wrap items-center gap-4 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-red-500" />
              <span>Mirchi Chaats, Vysial Street, Town Hall, Coimbatore</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-yellow-300">
              <Phone className="w-3.5 h-3.5 text-red-500" />
              <span>Shop Helpline: 9994147744 / 9597400881</span>
            </div>
          </div>
        </div>

        {/* Live Milestone Status Timeline */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white">
                Live Kitchen Status
              </h2>
              <p className="text-xs text-slate-400">
                Real status verified directly with the Vysial Street kitchen counter
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-950/40 border border-orange-500/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span>{order.status.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {isCancelled ? (
            <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-xl text-rose-300 space-y-1">
              <div className="font-bold text-sm">Order Cancelled</div>
              <p className="text-xs text-rose-300/80">
                This order was cancelled. Reason: {order.orderNotes || 'Cancelled per customer or kitchen request'}.
              </p>
            </div>
          ) : (
            <div className="relative pt-2 pb-2">
              {/* Progress bar line */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;

                  return (
                    <div
                      key={step.status}
                      className={`relative p-3 rounded-xl border transition ${
                        isCurrent
                          ? 'bg-orange-950/40 border-orange-500 text-white shadow-lg shadow-orange-950/40'
                          : isCompleted
                          ? 'bg-slate-800/60 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-900/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? 'bg-orange-600 text-white'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <span className="text-xs font-bold truncate">
                          {step.label}
                        </span>
                      </div>
                      <p className="text-[11px] leading-tight opacity-80">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delivery partner transparency info */}
          {order.orderType === 'DELIVERY' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-200 flex items-center gap-2">
                  <Bike className="w-4 h-4 text-orange-400" />
                  <span>
                    Delivery Service: {order.deliveryProvider || 'Shop In-House Delivery (Town Hall Fleet)'}
                  </span>
                </div>
                {order.deliveryTrackingRef ? (
                  <div className="text-slate-400">
                    Carrier Reference / Rider: <strong>{order.deliveryTrackingRef}</strong>
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px]">
                    Delivery assignment confirmed upon kitchen packaging completion.
                  </div>
                )}
              </div>

              {order.deliveryTrackingUrl && (
                <a
                  href={order.deliveryTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  <span>Carrier Tracking Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Order Details & Receipt */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Items list */}
          <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">
              Ordered Items ({order.items.length})
            </h3>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 py-2 border-b border-slate-800/60 last:border-0 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">
                        {item.productName}
                      </span>
                      <span className="text-slate-400">× {item.quantity}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-400">
                      {item.customizations?.map((c) => (
                        <span
                          key={c.id}
                          className="bg-yellow-950/40 text-yellow-400 px-1.5 py-0.5 rounded"
                        >
                          +{c.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="font-bold text-slate-200">
                    ₹{item.subtotal}
                  </div>
                </div>
              ))}
            </div>

            {order.orderNotes && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Order Instructions:
                </span>
                <span className="text-slate-200 italic">&quot;{order.orderNotes}&quot;</span>
              </div>
            )}
          </div>

          {/* Right: Bill breakdown & customer details */}
          <div className="md:col-span-5 space-y-4">
            {/* Customer Details */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <h3 className="font-bold text-white border-b border-slate-800 pb-2">
                Customer Information
              </h3>
              <div className="space-y-1.5 text-slate-300">
                <div>
                  <span className="text-slate-400">Name: </span>
                  <strong className="text-white">{order.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Phone: </span>
                  <strong className="text-white">{order.customerPhone}</strong>
                </div>
                {order.orderType === 'DELIVERY' && order.deliveryAddress && (
                  <div>
                    <span className="text-slate-400">Delivery Address: </span>
                    <div className="text-slate-200 mt-0.5">{order.deliveryAddress}</div>
                    {order.landmark && (
                      <div className="text-slate-400 text-[11px]">
                        Landmark: {order.landmark}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2.5 text-xs">
              <h3 className="font-bold text-white border-b border-slate-800 pb-2">
                Payment Summary
              </h3>

              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-200">₹{order.subtotal}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount {order.appliedPromo ? `(${order.appliedPromo})` : ''}</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Delivery Fee</span>
                <span className="text-slate-200">
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>GST (5%)</span>
                <span className="text-slate-200">₹{order.taxAmount}</span>
              </div>

              <div className="flex justify-between font-extrabold text-sm text-white pt-2 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-orange-400 text-base">₹{order.finalAmount}</span>
              </div>

              <div className="pt-2 text-center text-[10px] text-slate-500">
                Thank you for supporting Mirchi Chaats directly!
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#0c0f17] flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium">Loading tracking status...</p>
          </div>
        </div>
      }
    >
      <CartProvider>
        <OrderTrackingContent />
      </CartProvider>
    </React.Suspense>
  );
}

