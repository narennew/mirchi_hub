'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MenuItem,
  Order,
  OrderStatus,
  PromoCode,
  StoreSettings,
  Category,
} from '@/types';
import {
  Flame,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Settings,
  BarChart3,
  CheckCircle,
  Clock,
  Bike,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Download,
  AlertTriangle,
  ArrowLeft,
  Search,
  DollarSign,
  TrendingUp,
  Percent,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<
    'orders' | 'products' | 'promos' | 'delivery' | 'analytics'
  >('orders');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filters & search
  const [orderFilter, setOrderFilter] = useState<string>('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Edit/Create Product Modal state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    categoryId: 'cat-mirchi',
    price: 60,
    spiceLevel: 'Medium' as 'Mild' | 'Medium' | 'Extra Spicy',
    isAvailable: true,
    isBestseller: false,
    isVerified: true,
    imageUrl: '/images/hero.jpg',
  });

  // Create Promo Modal state
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
    discountValue: 15,
    minOrderValue: 150,
    maxDiscount: 50,
  });

  // Assign delivery tracking modal
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [dispatchTrackingRef, setDispatchTrackingRef] = useState('');
  const [dispatchProvider, setDispatchProvider] = useState(
    'Shop In-House Delivery (Town Hall Fleet)'
  );

  // Check stored auth session
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('mirchi_admin_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'mirchi123' || pinInput === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('mirchi_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid Admin PIN. (Default demo PIN: mirchi123)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mirchi_admin_auth');
  };

  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [menuRes, ordersRes, promosRes, configRes, analyticsRes] = await Promise.all([
        fetch('/api/menu').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/promos').then((r) => r.json()),
        fetch('/api/admin/config').then((r) => r.json()),
        fetch('/api/admin/analytics').then((r) => r.json()),
      ]);

      if (menuRes.success) {
        setItems(menuRes.items);
        setCategories(menuRes.categories);
      }
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (promosRes.success) setPromos(promosRes.promos);
      if (configRes.success) setSettings(configRes.settings);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
      const interval = setInterval(() => {
        // Background refresh orders & analytics
        fetch('/api/orders')
          .then((r) => r.json())
          .then((data) => data.success && setOrders(data.orders));
        fetch('/api/admin/analytics')
          .then((r) => r.json())
          .then((data) => data.success && setAnalytics(data.analytics));
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Status transitions
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    metadata?: any
  ) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...metadata }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
        refreshAllData();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Toggle item availability
  const handleToggleItemAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? data.item : i))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Verify item (approve seed data)
  const handleVerifyItem = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: true }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? data.item : i))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save product (create or update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await fetch(`/api/menu/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...productForm,
            price: Number(productForm.price),
          }),
        });
        const data = await res.json();
        if (data.success) {
          setItems((prev) =>
            prev.map((i) => (i.id === editingItem.id ? data.item : i))
          );
          setEditingItem(null);
        }
      } else {
        const res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...productForm,
            price: Number(productForm.price),
          }),
        });
        const data = await res.json();
        if (data.success) {
          setItems((prev) => [...prev, data.item]);
          setIsCreatingItem(false);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create promo code
  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoForm),
      });
      const data = await res.json();
      if (data.success) {
        setPromos((prev) => [...prev, data.promo]);
        setIsCreatingPromo(false);
        setPromoForm({
          code: '',
          description: '',
          discountType: 'PERCENTAGE',
          discountValue: 15,
          minOrderValue: 150,
          maxDiscount: 50,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update store settings
  const handleSaveSettings = async (updates: Partial<StoreSettings>) => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      'Order Number',
      'Date',
      'Customer',
      'Phone',
      'Type',
      'Status',
      'Subtotal',
      'Discount',
      'Delivery Fee',
      'Tax',
      'Total',
      'Payment Method',
      'Address',
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString(),
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      o.orderType,
      o.status,
      o.subtotal,
      o.discountAmount,
      o.deliveryFee,
      o.taxAmount,
      o.finalAmount,
      o.paymentMethod,
      `"${o.deliveryAddress || 'Takeaway'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `mirchi_chaats_orders_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If not authenticated, show PIN entry
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0c0f17] flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-yellow-400 p-0.5 mx-auto border-2 border-yellow-400 shadow-lg">
              <Image
                src="/images/logo.png"
                alt="Mirchi Chaats Logo"
                fill
                className="object-cover"
              />
            </div>
            <h1 className="text-xl font-black text-white">
              MIRCHI <span className="text-red-500">CHAATS</span>
            </h1>
            <p className="text-xs text-yellow-400 font-bold">
              Command Center • Vysial Street, Coimbatore
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enter Admin Access PIN
              </label>
              <input
                type="password"
                required
                placeholder="Enter PIN (demo: mirchi123)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-slate-950 text-center text-sm tracking-widest rounded-xl px-4 py-2.5 text-white border border-slate-700 focus:outline-none focus:border-orange-500"
              />
            </div>

            {authError && (
              <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-orange-600/20"
            >
              Sign In to Store Dashboard
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              ← Back to Customer Ordering
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'ACTIVE')
      return ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(
        o.status
      );
    return o.status === orderFilter;
  });

  // Filtered products
  const filteredProducts = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat =
      productCategoryFilter === 'all' || item.categoryId === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#0c0f17] text-slate-100 flex flex-col">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="relative w-10 h-10 rounded-xl overflow-hidden bg-yellow-400 p-0.5 border border-yellow-400 shrink-0 shadow"
            >
              <Image
                src="/images/logo.png"
                alt="Mirchi Chaats Logo"
                fill
                className="object-cover"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white">
                  MIRCHI <span className="text-red-500">CHAATS</span> Command Center
                </span>
                <span className="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded">
                  Admin
                </span>
              </div>
              <div className="text-[11px] text-yellow-400 font-bold">
                Vysial St, Town Hall • Live Orders &amp; Kitchen Management
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshAllData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/30 px-3 py-1.5 rounded-lg transition"
            >
              <span>Customer Storefront</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab switcher row */}
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto hide-scrollbar pt-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition shrink-0 ${
              activeTab === 'orders'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders Board ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition shrink-0 ${
              activeTab === 'products'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Menu &amp; Dishes ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('promos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition shrink-0 ${
              activeTab === 'promos'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Coupons &amp; Offers ({promos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition shrink-0 ${
              activeTab === 'delivery'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Delivery &amp; Transport Setup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics &amp; Contribution</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: ORDERS BOARD */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar text-xs">
                {['ALL', 'ACTIVE', 'PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                        orderFilter === st
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  )
                )}
              </div>

              <div className="text-xs text-slate-400">
                Showing {filteredOrders.length} orders
              </div>
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold">No orders matching this filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((ord) => {
                  return (
                    <div
                      key={ord.id}
                      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-lg"
                    >
                      {/* Top metadata */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-white">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              ord.status === 'PLACED'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : ord.status === 'PREPARING'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : ord.status === 'OUT_FOR_DELIVERY'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : ord.status === 'DELIVERED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 space-y-0.5">
                          <div className="font-semibold text-slate-100">
                            {ord.customerName} ({ord.customerPhone})
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {ord.orderType === 'DELIVERY'
                              ? `📍 ${ord.deliveryAddress}`
                              : '🏪 Counter Pickup'}
                          </div>
                          {ord.orderNotes && (
                            <div className="text-[11px] text-amber-400/90 italic">
                              Note: &quot;{ord.orderNotes}&quot;
                            </div>
                          )}
                        </div>

                        {/* Items list preview */}
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                          {ord.items.map((it) => (
                            <div
                              key={it.id}
                              className="flex items-center justify-between text-slate-300"
                            >
                              <span>
                                {it.quantity}× {it.productName}
                              </span>
                              <span className="font-semibold">₹{it.subtotal}</span>
                            </div>
                          ))}
                          <div className="pt-1 border-t border-slate-800 flex justify-between font-bold text-white text-xs">
                            <span>Total</span>
                            <span className="text-orange-400">₹{ord.finalAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Action Buttons */}
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <div className="text-[11px] text-slate-400 font-semibold mb-1">
                          Update Kitchen Status:
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          {ord.status === 'PLACED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(ord.id, 'ACCEPTED')}
                              className="col-span-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-1.5 rounded-lg transition"
                            >
                              ✓ Accept Order
                            </button>
                          )}

                          {ord.status === 'ACCEPTED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(ord.id, 'PREPARING')}
                              className="col-span-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 rounded-lg transition"
                            >
                              🍳 Start Cooking
                            </button>
                          )}

                          {ord.status === 'PREPARING' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateOrderStatus(ord.id, 'READY_FOR_PICKUP')
                              }
                              className="col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded-lg transition"
                            >
                              📦 Pack &amp; Mark Ready
                            </button>
                          )}

                          {ord.status === 'READY_FOR_PICKUP' && ord.orderType === 'DELIVERY' && (
                            <button
                              type="button"
                              onClick={() => {
                                setDispatchModalOrder(ord);
                                setDispatchTrackingRef('');
                              }}
                              className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 rounded-lg transition"
                            >
                              🛵 Hand to Rider
                            </button>
                          )}

                          {ord.status === 'READY_FOR_PICKUP' && ord.orderType === 'TAKEAWAY' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(ord.id, 'DELIVERED')}
                              className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg transition"
                            >
                              ✓ Customer Picked Up
                            </button>
                          )}

                          {ord.status === 'OUT_FOR_DELIVERY' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(ord.id, 'DELIVERED')}
                              className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg transition"
                            >
                              ✓ Mark Delivered
                            </button>
                          )}

                          {['PLACED', 'ACCEPTED', 'PREPARING'].includes(ord.status) && (
                            <button
                              type="button"
                              onClick={() => {
                                const reason = prompt('Reason for cancellation:');
                                if (reason) {
                                  handleUpdateOrderStatus(ord.id, 'CANCELLED', {
                                    cancellationReason: reason,
                                  });
                                }
                              }}
                              className="col-span-2 text-rose-400 hover:text-rose-300 font-semibold text-[11px] py-1 transition"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS & MENU MANAGER */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter dishes..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 w-full focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setProductForm({
                      name: '',
                      description: '',
                      categoryId: 'cat-mirchi',
                      price: 60,
                      spiceLevel: 'Medium',
                      isAvailable: true,
                      isBestseller: false,
                      isVerified: true,
                      imageUrl: '/images/hero.jpg',
                    });
                    setIsCreatingItem(true);
                  }}
                  className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Dish</span>
                </button>
              </div>
            </div>

            {/* Dishes list table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Dish Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Spice</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4">Stock Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4 font-bold text-white">
                          <div>{prod.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal line-clamp-1">
                            {prod.description}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{prod.category}</td>
                        <td className="py-3 px-4 font-extrabold text-orange-400">
                          ₹{prod.price}
                        </td>
                        <td className="py-3 px-4">{prod.spiceLevel}</td>
                        <td className="py-3 px-4">
                          {prod.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              ✓ Verified
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleVerifyItem(prod)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 px-2.5 py-1 rounded-full border border-amber-500/40 transition"
                              title="Click to approve and verify price"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>Needs Review (Click to Approve)</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleItemAvailability(prod)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition ${
                              prod.isAvailable
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {prod.isAvailable ? 'In Stock' : 'Sold Out'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(prod);
                              setProductForm({
                                name: prod.name,
                                description: prod.description,
                                categoryId: prod.categoryId,
                                price: prod.price,
                                spiceLevel: prod.spiceLevel,
                                isAvailable: prod.isAvailable,
                                isBestseller: prod.isBestseller,
                                isVerified: prod.isVerified,
                                imageUrl: prod.imageUrl,
                              });
                            }}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROMOS & OFFERS */}
        {activeTab === 'promos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Promotional Codes</h2>
                <p className="text-xs text-slate-400">
                  Manage first-order discounts, percentage coupons, and loyalty offers
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingPromo(true)}
                className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Promo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {promos.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm bg-orange-950/50 text-orange-400 px-2.5 py-1 rounded-lg border border-orange-500/30">
                      {p.code}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{p.description}</p>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div>
                      Discount:{' '}
                      <strong className="text-white">
                        {p.discountType === 'PERCENTAGE'
                          ? `${p.discountValue}% (Max ₹${p.maxDiscount || 'None'})`
                          : `Flat ₹${p.discountValue}`}
                      </strong>
                    </div>
                    <div>
                      Min Order Value: <strong className="text-white">₹{p.minOrderValue}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DELIVERY & TRANSPORT INTEGRATION */}
        {activeTab === 'delivery' && settings && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">
                Delivery Settings &amp; Partner Integration
              </h2>
              <p className="text-xs text-slate-400">
                Configure delivery radius, fees, and state transport regulatory compliance
              </p>
            </div>

            {/* Tamil Nadu Bike Delivery Regulatory Alert */}
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
                <span>Tamil Nadu Commercial Carriage Legal Notice</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Commercial transport regulations in Tamil Nadu require verified commercial carriage
                authorizations for bike-based food transport. The Rapido bike courier provider is
                kept disabled by default to ensure regulatory compliance until official fleet
                authorizations are verified.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                  <input
                    type="checkbox"
                    checked={settings.rapidoBikeAllowed}
                    onChange={(e) =>
                      handleSaveSettings({ rapidoBikeAllowed: e.target.checked })
                    }
                    className="rounded border-slate-700 bg-slate-800 text-orange-600 focus:ring-0"
                  />
                  <span>Acknowledge Transport Verification &amp; Permit Status</span>
                </label>
              </div>
            </div>

            {/* Delivery Parameters Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
              <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">
                Coimbatore Delivery Radius &amp; Pricing
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Max Delivery Radius (km)
                  </label>
                  <input
                    type="number"
                    value={settings.deliveryRadiusKm}
                    onChange={(e) =>
                      handleSaveSettings({ deliveryRadiusKm: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 rounded-xl px-3 py-2 text-white border border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Base Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.baseDeliveryFee}
                    onChange={(e) =>
                      handleSaveSettings({ baseDeliveryFee: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 rounded-xl px-3 py-2 text-white border border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Free Delivery Order Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) =>
                      handleSaveSettings({
                        freeDeliveryThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 rounded-xl px-3 py-2 text-white border border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Active Delivery Provider
                  </label>
                  <select
                    value={settings.activeDeliveryProvider}
                    onChange={(e) =>
                      handleSaveSettings({ activeDeliveryProvider: e.target.value })
                    }
                    className="w-full bg-slate-950 rounded-xl px-3 py-2 text-white border border-slate-800"
                  >
                    <option value="Shop In-House Delivery (Town Hall Fleet)">
                      Shop In-House Delivery (Town Hall Fleet)
                    </option>
                    <option value="Dunzo for Business (Requires Merchant API)">
                      Dunzo for Business (Requires Merchant API)
                    </option>
                    <option value="Porter Enterprise Fleet">
                      Porter Enterprise Fleet
                    </option>
                    <option
                      value="Rapido Bike Courier"
                      disabled={!settings.rapidoBikeAllowed}
                    >
                      Rapido Bike Courier (Requires Transport Permit)
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS & CONTRIBUTION */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">
                Sales, Orders &amp; Unit Economics
              </h2>
              <p className="text-xs text-slate-400">
                Direct commerce metrics and estimated gross contribution after variable food costs
              </p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-xs text-slate-400 font-medium">Total Orders</div>
                <div className="text-2xl font-extrabold text-white">
                  {analytics.totalOrders}
                </div>
                <div className="text-[11px] text-emerald-400 font-medium">
                  Direct storefront orders
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-xs text-slate-400 font-medium">Gross Revenue</div>
                <div className="text-2xl font-extrabold text-orange-400">
                  ₹{analytics.totalRevenue}
                </div>
                <div className="text-[11px] text-slate-400">
                  Zero commission withheld
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-xs text-slate-400 font-medium">Average Order Value</div>
                <div className="text-2xl font-extrabold text-white">
                  ₹{analytics.averageOrderValue}
                </div>
                <div className="text-[11px] text-slate-400">AOV per transaction</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-xs text-slate-400 font-medium">
                  Estimated Gross Contribution
                </div>
                <div className="text-2xl font-extrabold text-emerald-400">
                  ₹{analytics.estimatedContribution}
                </div>
                <div className="text-[11px] text-emerald-400/80">
                  After estimated 40% variable food cost
                </div>
              </div>
            </div>

            {/* Review seed data alert if any */}
            {analytics.unverifiedItemsCount > 0 && (
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-amber-300">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>
                    You have <strong>{analytics.unverifiedItemsCount} unverified reference dishes</strong>{' '}
                    seeded from Swiggy reference. Please review in the Menu tab.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-3 py-1.5 rounded-lg border border-amber-500/40 transition shrink-0"
                >
                  Review Dishes
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* DISPATCH DELIVERY MODAL */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121824] border border-slate-700 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white">
                Dispatch Order #{dispatchModalOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setDispatchModalOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Delivery Provider
                </label>
                <input
                  type="text"
                  value={dispatchProvider}
                  onChange={(e) => setDispatchProvider(e.target.value)}
                  className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Rider Name / Tracking Reference *
                </label>
                <input
                  type="text"
                  placeholder="e.g. TH-RIDER-SURESH (+91 98421 XXXXX)"
                  value={dispatchTrackingRef}
                  onChange={(e) => setDispatchTrackingRef(e.target.value)}
                  className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDispatchModalOrder(null)}
                className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdateOrderStatus(dispatchModalOrder.id, 'OUT_FOR_DELIVERY', {
                    deliveryProvider: dispatchProvider,
                    deliveryTrackingRef: dispatchTrackingRef || 'Assigned Town Hall Staff',
                  });
                  setDispatchModalOrder(null);
                }}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-xl"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {(isCreatingItem || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveProduct}
            className="bg-[#121824] border border-slate-700 rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white">
                {editingItem ? `Edit: ${editingItem.name}` : 'Add New Street Chaat'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsCreatingItem(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category *</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: Number(e.target.value) })
                    }
                    className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Spice Level</label>
                  <select
                    value={productForm.spiceLevel}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        spiceLevel: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Extra Spicy">Extra Spicy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(e) =>
                      setProductForm({ ...productForm, isAvailable: e.target.checked })
                    }
                    className="rounded bg-slate-800"
                  />
                  <span>Available in Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={productForm.isBestseller}
                    onChange={(e) =>
                      setProductForm({ ...productForm, isBestseller: e.target.checked })
                    }
                    className="rounded bg-slate-800"
                  />
                  <span>Bestseller</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsCreatingItem(false);
                }}
                className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-xl"
              >
                Save Dish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE PROMO MODAL */}
      {isCreatingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSavePromo}
            className="bg-[#121824] border border-slate-700 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white">Create Promo Code</h3>
              <button
                type="button"
                onClick={() => setIsCreatingPromo(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI30"
                  value={promoForm.code}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })
                  }
                  className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 20% off on all weekend orders"
                  value={promoForm.description}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, description: e.target.value })
                  }
                  className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Type</label>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) =>
                      setPromoForm({
                        ...promoForm,
                        discountType: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Value *</label>
                  <input
                    type="number"
                    required
                    value={promoForm.discountValue}
                    onChange={(e) =>
                      setPromoForm({
                        ...promoForm,
                        discountValue: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={promoForm.minOrderValue}
                    onChange={(e) =>
                      setPromoForm({
                        ...promoForm,
                        minOrderValue: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={promoForm.maxDiscount}
                    onChange={(e) =>
                      setPromoForm({
                        ...promoForm,
                        maxDiscount: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-900 rounded-xl px-3 py-2 text-white border border-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreatingPromo(false)}
                className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-xl"
              >
                Create Promo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
