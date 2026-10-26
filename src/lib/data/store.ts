import fs from 'fs';
import path from 'path';
import {
  Category,
  MenuItem,
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  PromoCode,
  StoreSettings,
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_PROMOS,
  INITIAL_STORE_SETTINGS,
} from './seed';

interface DatabaseData {
  categories: Category[];
  items: MenuItem[];
  promos: PromoCode[];
  settings: StoreSettings;
  orders: Order[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Memory cache fallback for fast access
let inMemoryData: DatabaseData | null = null;

function ensureDataFile(): DatabaseData {
  if (inMemoryData) {
    return inMemoryData;
  }

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryData = JSON.parse(content);
      return inMemoryData!;
    }
  } catch (err) {
    console.warn('Failed to read database file, initializing defaults:', err);
  }

  // Initial seed orders for demonstration and analytics
  const initialOrders: Order[] = [
    {
      id: 'ord-1001',
      orderNumber: 'MC-2026-1001',
      customerName: 'Karthik Subramanian',
      customerPhone: '+91 98421 23456',
      customerEmail: 'karthik@example.com',
      orderType: 'DELIVERY',
      status: 'DELIVERED',
      deliveryAddress: '14, D.B. Road, RS Puram, Coimbatore',
      landmark: 'Near Flower Market',
      orderNotes: 'Please pack sweet chutney separately',
      subtotal: 240,
      discountAmount: 48,
      appliedPromo: 'CHAAT20',
      deliveryFee: 30,
      taxAmount: 9.6,
      finalAmount: 232,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      paymentGatewayRef: 'pay_rzp_demo_1001',
      deliveryProvider: 'Shop In-House Delivery (Town Hall Fleet)',
      deliveryTrackingRef: 'TH-DEL-89',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      items: [
        {
          id: 'item-1',
          productId: 'item-masala-puri',
          productName: 'Masala Puri',
          unitPrice: 60,
          quantity: 2,
          subtotal: 120,
          selectedSpice: 'Medium',
        },
        {
          id: 'item-2',
          productId: 'item-dahi-puri',
          productName: 'Dahi Puri',
          unitPrice: 80,
          quantity: 1,
          subtotal: 80,
          selectedSpice: 'Mild',
        },
        {
          id: 'item-3',
          productId: 'item-lemon-mint-mojito',
          productName: 'Lemon Mint Mojito',
          unitPrice: 65,
          quantity: 1,
          subtotal: 65,
          selectedSpice: 'Mild',
        },
      ],
    },
    {
      id: 'ord-1002',
      orderNumber: 'MC-2026-1002',
      customerName: 'Ananya Ramesh',
      customerPhone: '+91 97910 88765',
      customerEmail: 'ananya@example.com',
      orderType: 'TAKEAWAY',
      status: 'PREPARING',
      orderNotes: 'Less spicy for kids',
      subtotal: 190,
      discountAmount: 0,
      deliveryFee: 0,
      taxAmount: 9.5,
      finalAmount: 200,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 900000).toISOString(),
      items: [
        {
          id: 'item-4',
          productId: 'item-combo-3',
          productName: 'Combo 3 (Dahi Puri + Bhel Puri + Gulab Jamun)',
          unitPrice: 190,
          quantity: 1,
          subtotal: 190,
          selectedSpice: 'Mild',
        },
      ],
    },
    {
      id: 'ord-1003',
      orderNumber: 'MC-2026-1003',
      customerName: 'Senthil Kumar',
      customerPhone: '+91 94431 55432',
      customerEmail: 'senthil@example.com',
      orderType: 'DELIVERY',
      status: 'PLACED',
      deliveryAddress: 'Plot 7, Raja Street, Town Hall, Coimbatore',
      landmark: 'Opposite Koniamman Temple',
      orderNotes: 'Call upon arrival',
      subtotal: 310,
      discountAmount: 50,
      appliedPromo: 'WELCOME50',
      deliveryFee: 0,
      taxAmount: 13,
      finalAmount: 273,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      paymentGatewayRef: 'pay_rzp_demo_1003',
      deliveryProvider: 'Shop In-House Delivery (Town Hall Fleet)',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      updatedAt: new Date(Date.now() - 600000).toISOString(),
      items: [
        {
          id: 'item-5',
          productId: 'item-cheese-pav-bhaji',
          productName: 'Cheese Pav Bhaji',
          unitPrice: 110,
          quantity: 2,
          subtotal: 220,
          selectedSpice: 'Medium',
        },
        {
          id: 'item-6',
          productId: 'item-blue-coraco',
          productName: 'Blue Coraco',
          unitPrice: 75,
          quantity: 1,
          subtotal: 75,
          selectedSpice: 'Mild',
        },
      ],
    },
  ];

  inMemoryData = {
    categories: INITIAL_CATEGORIES,
    items: INITIAL_MENU_ITEMS,
    promos: INITIAL_PROMOS,
    settings: INITIAL_STORE_SETTINGS,
    orders: initialOrders,
  };

  saveData(inMemoryData);
  return inMemoryData;
}

function saveData(data: DatabaseData) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data to file:', err);
  }
}

export const dbStore = {
  // Categories
  getCategories(): Category[] {
    const data = ensureDataFile();
    return data.categories.map((cat) => ({
      ...cat,
      itemCount: data.items.filter((item) => item.categoryId === cat.id && item.isAvailable).length,
    }));
  },

  // Menu Items
  getMenuItems(options?: {
    categorySlug?: string;
    searchQuery?: string;
    onlyAvailable?: boolean;
    spiceLevel?: string;
  }): MenuItem[] {
    const data = ensureDataFile();
    let result = [...data.items];

    if (options?.onlyAvailable) {
      result = result.filter((item) => item.isAvailable);
    }

    if (options?.categorySlug && options.categorySlug !== 'all') {
      const cat = data.categories.find((c) => c.slug === options.categorySlug);
      if (cat) {
        if (cat.slug === 'recommended') {
          result = result.filter((item) => item.isBestseller);
        } else {
          result = result.filter((item) => item.categoryId === cat.id);
        }
      }
    }

    if (options?.searchQuery) {
      const q = options.searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    if (options?.spiceLevel && options.spiceLevel !== 'all') {
      result = result.filter((item) => item.spiceLevel === options.spiceLevel);
    }

    return result;
  },

  getMenuItemById(id: string): MenuItem | undefined {
    const data = ensureDataFile();
    return data.items.find((item) => item.id === id);
  },

  updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | null {
    const data = ensureDataFile();
    const idx = data.items.findIndex((item) => item.id === id);
    if (idx === -1) return null;

    data.items[idx] = {
      ...data.items[idx],
      ...updates,
    };
    saveData(data);
    return data.items[idx];
  },

  createMenuItem(item: Omit<MenuItem, 'id'>): MenuItem {
    const data = ensureDataFile();
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    data.items.push(newItem);
    saveData(data);
    return newItem;
  },

  deleteMenuItem(id: string): boolean {
    const data = ensureDataFile();
    const idx = data.items.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    data.items.splice(idx, 1);
    saveData(data);
    return true;
  },

  // Promos
  getPromos(): PromoCode[] {
    const data = ensureDataFile();
    return data.promos;
  },

  getPromoByCode(code: string): PromoCode | undefined {
    const data = ensureDataFile();
    return data.promos.find(
      (p) => p.code.toUpperCase() === code.toUpperCase().trim() && p.isActive
    );
  },

  createPromo(promo: Omit<PromoCode, 'id'>): PromoCode {
    const data = ensureDataFile();
    const newPromo: PromoCode = {
      ...promo,
      id: `promo-${Date.now()}`,
      code: promo.code.toUpperCase().trim(),
    };
    data.promos.push(newPromo);
    saveData(data);
    return newPromo;
  },

  deletePromo(id: string): boolean {
    const data = ensureDataFile();
    const idx = data.promos.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    data.promos.splice(idx, 1);
    saveData(data);
    return true;
  },

  // Store Settings
  getSettings(): StoreSettings {
    const data = ensureDataFile();
    return data.settings;
  },

  updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    const data = ensureDataFile();
    data.settings = {
      ...data.settings,
      ...updates,
    };
    saveData(data);
    return data.settings;
  },

  // Orders
  getOrders(options?: { status?: OrderStatus; search?: string }): Order[] {
    const data = ensureDataFile();
    let result = [...data.orders];

    if (options?.status) {
      result = result.filter((o) => o.status === options.status);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
      );
    }

    // Sort newest first
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getOrderById(idOrNumber: string): Order | undefined {
    const data = ensureDataFile();
    return data.orders.find(
      (o) =>
        o.id === idOrNumber ||
        o.orderNumber.toUpperCase() === idOrNumber.toUpperCase()
    );
  },

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const data = ensureDataFile();
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MC-2026-${randomSuffix}`;

    const newOrder: Order = {
      ...orderData,
      id: `ord-${timestamp}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.orders.unshift(newOrder);
    saveData(data);
    return newOrder;
  },

  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    metadata?: {
      deliveryProvider?: string;
      deliveryTrackingRef?: string;
      deliveryTrackingUrl?: string;
      cancellationReason?: string;
    }
  ): Order | null {
    const data = ensureDataFile();
    const idx = data.orders.findIndex(
      (o) => o.id === orderId || o.orderNumber === orderId
    );
    if (idx === -1) return null;

    data.orders[idx] = {
      ...data.orders[idx],
      status,
      ...metadata,
      updatedAt: new Date().toISOString(),
    };

    saveData(data);
    return data.orders[idx];
  },

  // Analytics & Sales summary
  getAnalytics() {
    const data = ensureDataFile();
    const orders = data.orders.filter((o) => o.status !== 'CANCELLED');

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Estimate variable cost & contribution margin
    const estimatedVariableCosts = orders.reduce(
      (sum, o) => sum + Math.round(o.subtotal * (data.settings.variableCostRatio || 0.40)),
      0
    );
    const estimatedContribution = Math.max(0, totalRevenue - estimatedVariableCosts);

    // Group by status
    const statusCounts: Record<OrderStatus, number> = {
      PLACED: 0,
      ACCEPTED: 0,
      PREPARING: 0,
      READY_FOR_PICKUP: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    data.orders.forEach((o) => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    });

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      estimatedVariableCosts,
      estimatedContribution,
      statusCounts,
      unverifiedItemsCount: data.items.filter((item) => !item.isVerified).length,
    };
  },
};
