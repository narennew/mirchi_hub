export interface DeliveryProviderConfig {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  isLegallyVerified: boolean;
  requiresCredentials: boolean;
  complianceWarning?: string;
  setupInstructions?: string;
}

export interface DeliveryCalculation {
  isDeliverable: boolean;
  distanceKm: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  isFreeDelivery: boolean;
  estimatedMinutes: number;
  reason?: string;
}

export interface AssignDeliveryParams {
  orderId: string;
  providerId: string;
  trackingRef?: string;
  trackingUrl?: string;
  riderName?: string;
  riderPhone?: string;
}

export const DELIVERY_PROVIDERS: Record<string, DeliveryProviderConfig> = {
  in_house: {
    id: 'in_house',
    name: 'Shop In-House Delivery (Town Hall Fleet)',
    description: 'Direct delivery by Mirchi Chaats staff within Coimbatore Town Hall & RS Puram radius.',
    isAvailable: true,
    isLegallyVerified: true,
    requiresCredentials: false,
    setupInstructions: 'Managed directly by store staff. No external API keys required.',
  },
  dunzo: {
    id: 'dunzo',
    name: 'Dunzo for Business (Direct B2B)',
    description: 'On-demand commercial courier delivery via Dunzo merchant API.',
    isAvailable: false,
    isLegallyVerified: true,
    requiresCredentials: true,
    setupInstructions: 'Requires merchant approval and DUNZO_CLIENT_ID / DUNZO_CLIENT_SECRET environment variables.',
  },
  porter: {
    id: 'porter',
    name: 'Porter Enterprise',
    description: 'Commercial 2-wheeler / 3-wheeler verified fleet for food parcels.',
    isAvailable: false,
    isLegallyVerified: true,
    requiresCredentials: true,
    setupInstructions: 'Requires active Porter Enterprise merchant token in PORTER_API_KEY environment variable.',
  },
  rapido: {
    id: 'rapido',
    name: 'Rapido Bike Courier',
    description: 'On-demand two-wheeler delivery network.',
    isAvailable: false,
    isLegallyVerified: false,
    requiresCredentials: true,
    complianceWarning:
      'LEGAL WARNING: Bike-based commercial food carriage in Tamil Nadu is subject to strict transport department regulations and commercial permit compliance. This integration is kept disabled by default until the store management submits verified vehicle authorization documents and carrier terms.',
    setupInstructions:
      'Store administration must verify applicable state transport rules and sign official B2B corporate logistics terms before activating.',
  },
};

export function calculateDeliveryFee(
  subtotal: number,
  distanceKm: number,
  baseFee: number = 30,
  maxRadius: number = 8,
  freeThreshold: number = 399
): DeliveryCalculation {
  if (distanceKm > maxRadius) {
    return {
      isDeliverable: false,
      distanceKm,
      deliveryFee: 0,
      freeDeliveryThreshold: freeThreshold,
      isFreeDelivery: false,
      estimatedMinutes: 0,
      reason: `Address is ${distanceKm} km away, which exceeds our maximum fresh chaat delivery radius of ${maxRadius} km from Vysial Street, Town Hall.`,
    };
  }

  const isFree = subtotal >= freeThreshold;
  // Tiered calculation: baseFee for first 3 km, + ₹10 per km thereafter
  let fee = isFree ? 0 : baseFee;
  if (!isFree && distanceKm > 3) {
    fee += Math.round((distanceKm - 3) * 10);
  }

  // Fresh hot chaat delivery estimate: 20 mins preparation + ~3 mins per km
  const estimatedMinutes = Math.min(60, 20 + Math.round(distanceKm * 3));

  return {
    isDeliverable: true,
    distanceKm,
    deliveryFee: fee,
    freeDeliveryThreshold: freeThreshold,
    isFreeDelivery: isFree,
    estimatedMinutes,
  };
}
