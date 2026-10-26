export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderType = 'DELIVERY' | 'TAKEAWAY';

export type PaymentMethod = 'COD' | 'ONLINE';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type SpiceLevel = 'Mild' | 'Medium' | 'Extra Spicy';

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId: string;
  price: number;
  description: string;
  imageUrl: string;
  isVegetarian: boolean;
  spiceLevel: SpiceLevel;
  isBestseller: boolean;
  isAvailable: boolean;
  isVerified: boolean; // Seed data review flag
  verificationNotes?: string;
  estimatedCost: number; // For variable cost / margin estimation
  availableCustomizations: CustomizationOption[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  sortOrder: number;
  itemCount?: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedSpice: SpiceLevel;
  selectedCustomizations: CustomizationOption[];
  notes?: string;
  imageUrl: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  selectedSpice?: SpiceLevel;
  customizations?: CustomizationOption[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: OrderType;
  status: OrderStatus;
  deliveryAddress?: string;
  pincode?: string;
  landmark?: string;
  orderNotes?: string;
  
  subtotal: number;
  discountAmount: number;
  appliedPromo?: string;
  deliveryFee: number;
  taxAmount: number;
  finalAmount: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentGatewayRef?: string;

  deliveryProvider?: string;
  deliveryTrackingRef?: string;
  deliveryTrackingUrl?: string;

  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  address: string;
  deliveryRadiusKm: number;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  isDeliveryActive: boolean;
  isTakeawayActive: boolean;
  activeDeliveryProvider: string;
  rapidoBikeAllowed: boolean;
  rapidoBikeNotice: string;
  estimatedDeliveryMins: number;
  gstPercentage: number;
  variableCostRatio: number;
}
