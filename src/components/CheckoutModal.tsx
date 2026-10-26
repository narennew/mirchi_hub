'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';
import { useCart } from '@/context/CartContext';
import { generateOrderWhatsAppMessage, getWhatsAppUrl, MIRCHI_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import {
  X,
  MapPin,
  Phone,
  User,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Hash,
  Clock,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CheckoutStep = 'DETAILS' | 'PAYMENT_SCANNER' | 'CONFIRMED';

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const router = useRouter();
  const {
    items,
    subtotal,
    deliveryFee,
    taxAmount,
    finalAmount,
    clearCart,
    addRecentOrder,
  } = useCart();

  const [step, setStep] = useState<CheckoutStep>('DETAILS');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 5-minute timer (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('');
  const [createdOrderWhatsAppUrl, setCreatedOrderWhatsAppUrl] = useState<string>('');

  const upiId = '9597400881@upi';
  const upiUrl = `upi://pay?pa=${upiId}&pn=Mirchi%20Chaats&am=${finalAmount}&cu=INR&tn=Mirchi%20Chaats%20Order`;

  // Generate QR Code whenever finalAmount changes or scanner opens
  useEffect(() => {
    if (finalAmount > 0) {
      QRCode.toDataURL(upiUrl, {
        width: 280,
        margin: 1.5,
        color: {
          dark: '#261014',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating UPI QR code:', err));
    }
  }, [upiUrl, finalAmount]);

  // 5-minute countdown timer effect
  useEffect(() => {
    if (step !== 'PAYMENT_SCANNER') return;

    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  if (!isOpen) return null;

  // Format mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const timerPercent = (timeLeft / 300) * 100;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validation
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }
    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
      setErrorMessage('Please enter your complete delivery address in Coimbatore');
      return;
    }
    const cleanPincode = pincode.replace(/\D/g, '');
    if (!cleanPincode || cleanPincode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit Coimbatore pincode (e.g. 641001, 641039)');
      return;
    }

    // Reset timer to 5 minutes and proceed to UPI Scanner step
    setTimeLeft(300);
    setStep('PAYMENT_SCANNER');
  };

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleConfirmPaymentAndSendOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const cleanPhone = customerPhone.replace(/\D/g, '');
    const cleanPincode = pincode.replace(/\D/g, '');
    const fullAddress = `${deliveryAddress.trim()}, Coimbatore`;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          orderType: 'DELIVERY',
          deliveryAddress: fullAddress,
          pincode: cleanPincode,
          orderNotes: orderNotes.trim() || undefined,
          items: items.map((ci) => ({
            menuItemId: ci.menuItemId,
            name: ci.name,
            quantity: ci.quantity,
            selectedSpice: ci.selectedSpice,
            selectedCustomizations: ci.selectedCustomizations,
            notes: ci.notes,
          })),
          paymentMethod: 'ONLINE',
          distanceKm: 2.5,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to submit order. Please retry.');
        setIsSubmitting(false);
        return;
      }

      const createdOrder = data.order;
      setCreatedOrderNumber(createdOrder.orderNumber);
      addRecentOrder(createdOrder.orderNumber);

      // Generate pre-filled WhatsApp message directed to +91 9597400881
      const waMsg = generateOrderWhatsAppMessage({
        orderNumber: createdOrder.orderNumber,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: fullAddress,
        pincode: cleanPincode,
        orderNotes: orderNotes.trim(),
        items: items.map((ci) => ({
          name: ci.name,
          quantity: ci.quantity,
          subtotal: ci.price * ci.quantity,
          selectedCustomizations: ci.selectedCustomizations,
        })),
        subtotal,
        deliveryFee,
        taxAmount,
        finalAmount,
        paymentMethod: 'ONLINE (UPI)',
        paymentStatus: 'PAID',
      });

      const waUrl = getWhatsAppUrl(waMsg);
      setCreatedOrderWhatsAppUrl(waUrl);

      // Clear cart
      clearCart();

      // Trigger WhatsApp in new window/tab
      try {
        window.open(waUrl, '_blank');
      } catch (e) {
        console.warn('Popup blocked, customer can click WhatsApp button:', e);
      }

      setIsSubmitting(false);
      setStep('CONFIRMED');
    } catch (err) {
      console.error('Order submission error:', err);
      setErrorMessage('Network or server error while placing order. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-4 border-yellow-400 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b-2 border-yellow-400 flex items-center justify-between bg-[#FFDE00]">
          <div>
            <h2 className="text-base font-black text-[#261014] flex items-center gap-2">
              <span>
                {step === 'PAYMENT_SCANNER'
                  ? 'Scan & Pay via UPI (5 Min Timer)'
                  : step === 'CONFIRMED'
                  ? 'Order Confirmed!'
                  : 'Doorstep Delivery Details'}
              </span>
            </h2>
            <p className="text-xs text-red-700 font-extrabold">
              Mirchi Chaats • Vysial Street, Town Hall • Helpline: +91 9597400881
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#261014] hover:text-black flex items-center justify-center transition border-2 border-red-600 shadow-sm"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* STEP 1: CUSTOMER DETAILS */}
        {step === 'DETAILS' && (
          <form
            onSubmit={handleProceedToPayment}
            className="flex-1 overflow-y-auto p-5 space-y-4 text-xs bg-[#FFFDF5]"
          >
            {errorMessage && (
              <div className="bg-red-100 border-2 border-red-500 p-3 rounded-2xl text-red-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase text-[#261014] tracking-wider">
                Customer Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-red-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white text-xs rounded-xl pl-9 pr-3 py-2 text-[#261014] border-2 border-yellow-400 focus:outline-none focus:border-red-600 font-bold shadow-sm"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-red-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-white text-xs rounded-xl pl-9 pr-3 py-2 text-[#261014] border-2 border-yellow-400 focus:outline-none focus:border-red-600 font-bold shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Location Details */}
            <div className="space-y-3 pt-2 border-t border-yellow-300">
              <div className="text-xs font-black uppercase text-[#261014] tracking-wider">
                Coimbatore Delivery Address
              </div>

              {/* Address */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Address *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-red-600 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    required
                    placeholder="Street, Building / Door No., Area"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-white text-xs rounded-xl pl-9 pr-3 py-2 text-[#261014] border-2 border-yellow-400 focus:outline-none focus:border-red-600 font-bold shadow-sm"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Pincode *
                </label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-red-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit pincode (e.g. 641001, 641039)"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white text-xs rounded-xl pl-9 pr-3 py-2 text-[#261014] border-2 border-yellow-400 focus:outline-none focus:border-red-600 font-bold shadow-sm"
                  />
                </div>
              </div>

              {/* Optional cooking notes */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Cooking Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pack pani separately, extra crispy puris..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-white text-xs rounded-xl px-3 py-2 text-[#261014] border-2 border-yellow-400 focus:outline-none focus:border-red-600 font-bold shadow-sm"
                />
              </div>
            </div>

            {/* Payment Method - Online Payment */}
            <div className="space-y-2 pt-2 border-t border-yellow-300">
              <div className="text-xs font-black uppercase text-[#261014] tracking-wider">
                Payment Method
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-red-600 bg-red-50 text-[#261014] shadow-sm">
                <CreditCard className="w-5 h-5 text-red-600 shrink-0" />
                <div className="flex-1">
                  <div className="font-black text-xs text-[#261014] flex items-center justify-between">
                    <span>Online Payment (UPI / QR)</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-400 px-2 py-0.5 rounded-full font-black">
                      ✓ Instant QR Scanner
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-bold mt-0.5">
                    Pay via GPay, PhonePe, Paytm, or BHIM with a 5-minute timer
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Snapshot */}
            <div className="bg-white border-2 border-yellow-400 p-3.5 rounded-2xl space-y-1.5 shadow-sm">
              <div className="flex justify-between text-slate-700 font-bold">
                <span>Dishes ({items.length})</span>
                <span className="text-[#261014]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-bold">
                <span>Delivery Charge</span>
                <span className="text-[#261014]">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-700 font-bold">
                <span>GST (5%)</span>
                <span className="text-[#261014]">₹{taxAmount}</span>
              </div>
              <div className="flex justify-between font-black text-[#261014] pt-2 border-t-2 border-yellow-200 text-sm">
                <span>Total Payable</span>
                <span className="text-red-600 text-xl font-black">₹{finalAmount}</span>
              </div>
            </div>

            {/* Submit to Open QR Scanner */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-xl shadow-red-600/30 border-2 border-yellow-300 transition active:scale-98"
              >
                <ShieldCheck className="w-4 h-4 text-yellow-300" />
                <span>Pay &amp; Confirm Order • ₹{finalAmount}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: 5-MINUTE LIVE UPI QR SCANNER */}
        {step === 'PAYMENT_SCANNER' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs bg-[#FFFDF5]">
            {errorMessage && (
              <div className="bg-red-100 border-2 border-red-500 p-3 rounded-2xl text-red-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 5-Minute Timer Display Bar */}
            <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white p-3.5 rounded-2xl shadow-md space-y-2">
              <div className="flex items-center justify-between font-black">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-300 animate-spin" />
                  <span className="tracking-wide uppercase text-[11px]">
                    Payment Session Active
                  </span>
                </div>
                <div className="font-mono text-base tracking-wider bg-black/40 px-2.5 py-0.5 rounded-lg border border-yellow-400 text-yellow-300">
                  {formattedTime}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeLeft < 60 ? 'bg-red-300 animate-pulse' : 'bg-yellow-300'
                  }`}
                  style={{ width: `${timerPercent}%` }}
                />
              </div>

              <div className="text-[11px] text-white/90 font-bold text-center">
                Please complete payment within 5 minutes to confirm kitchen prep.
              </div>
            </div>

            {/* Amount Payable Hero */}
            <div className="text-center bg-white border-2 border-yellow-400 rounded-2xl p-3 shadow-sm">
              <div className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                Total Amount to Pay
              </div>
              <div className="text-3xl font-black text-red-600 mt-0.5">
                ₹{finalAmount}
              </div>
              <div className="text-[11px] text-[#261014] font-bold">
                Order for: <span className="font-black">{customerName}</span> ({customerPhone})
              </div>
            </div>

            {/* QR Code Scanner Box */}
            <div className="bg-white border-3 border-yellow-400 rounded-3xl p-5 shadow-lg text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-black text-[#261014]">
                <span className="text-red-600 text-base">🌶️</span>
                <span>MIRCHI CHAATS UPI SCANNER</span>
              </div>

              {/* The QR Image */}
              <div className="relative mx-auto w-[230px] h-[230px] bg-white p-2 rounded-2xl border-2 border-slate-200 shadow-inner flex items-center justify-center">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="Mirchi Chaats UPI QR Code Scanner"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* UPI ID & Copy button */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className="bg-yellow-50 border-2 border-yellow-400 px-3 py-1.5 rounded-xl font-mono text-xs font-black text-[#261014]">
                  UPI ID: <span className="text-red-600">{upiId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="flex items-center gap-1 bg-white hover:bg-yellow-100 border-2 border-red-600 text-red-700 px-3 py-1.5 rounded-xl font-black text-xs transition"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Supported apps */}
              <div className="text-[10px] text-slate-600 font-bold">
                Scan with Google Pay, PhonePe, Paytm, Cred, or any UPI App
              </div>

              {/* Direct UPI Intent Link for Mobile */}
              <div className="pt-1">
                <a
                  href={upiUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 hover:text-red-700 underline"
                >
                  <span>Tap to open UPI app directly on this phone</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Timer Expired Warning */}
            {timeLeft <= 0 && (
              <div className="bg-red-100 border-2 border-red-500 p-3 rounded-2xl text-center space-y-2">
                <div className="text-red-700 font-black">
                  Session expired after 5 minutes.
                </div>
                <button
                  type="button"
                  onClick={() => setTimeLeft(300)}
                  className="inline-flex items-center gap-1 bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-lg"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart 5 Min Timer</span>
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmPaymentAndSendOrder}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-xl shadow-emerald-600/30 border-2 border-yellow-300 transition active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirming Payment &amp; Sending to WhatsApp...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span>✅ I Have Paid • Send Order to WhatsApp</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-yellow-50 text-[#261014] font-bold text-xs py-2 rounded-xl border border-yellow-400 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Edit Customer Details</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ORDER CONFIRMED & WHATSAPP REDIRECT */}
        {step === 'CONFIRMED' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-center bg-[#FFFDF5]">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-3 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#261014]">
                Order Placed &amp; Payment Received!
              </h3>
              <p className="text-xs font-mono font-black text-red-600">
                Order #{createdOrderNumber}
              </p>
            </div>

            {/* WhatsApp notification highlight card */}
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-left space-y-2 shadow-sm">
              <div className="flex items-center gap-2 font-black text-emerald-900 text-xs">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Notification to Owner (+91 {MIRCHI_WHATSAPP_NUMBER.slice(2)})</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-bold leading-relaxed">
                Your order receipt, delivery address, and payment confirmation have been prepared. If WhatsApp didn&apos;t open automatically, tap below to send it directly!
              </p>
              {createdOrderWhatsAppUrl && (
                <a
                  href={createdOrderWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp &amp; Send Order Details</span>
                </a>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/order/${createdOrderNumber}`);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md border-2 border-yellow-300 transition"
              >
                Track Live Order Status
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-slate-600 hover:text-black underline"
              >
                Close &amp; Return to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
