import { CartItem, Order } from '@/types';

export const MIRCHI_WHATSAPP_NUMBER = '919597400881';

export function generateOrderWhatsAppMessage(data: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  pincode: string;
  orderNotes?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice?: number;
    subtotal?: number;
    selectedCustomizations?: Array<{ name: string; price: number }>;
  }>;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  finalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
}): string {
  const itemsList = data.items
    .map((item) => {
      const addons =
        item.selectedCustomizations && item.selectedCustomizations.length > 0
          ? ` (${item.selectedCustomizations.map((a) => a.name).join(', ')})`
          : '';
      const priceText = item.subtotal ? ` - ₹${item.subtotal}` : '';
      return `• ${item.quantity}x ${item.name}${addons}${priceText}`;
    })
    .join('\n');

  const notesText = data.orderNotes?.trim()
    ? `\n• *Special Instructions:* ${data.orderNotes.trim()}`
    : '';

  return `*🌶️ NEW ORDER - MIRCHI CHAATS*
*Order ID:* #${data.orderNumber}
*Payment Status:* ✅ PAID ONLINE (₹${data.finalAmount})
*Date:* ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}

*👤 Customer Details:*
• *Name:* ${data.customerName}
• *Phone:* ${data.customerPhone}
• *Delivery Address:* ${data.deliveryAddress}
• *Pincode:* ${data.pincode}${notesText}

*🍽️ Items Ordered:*
${itemsList}

*💰 Bill Summary:*
• *Dishes Subtotal:* ₹${data.subtotal}
• *Delivery Charge:* ${data.deliveryFee === 0 ? 'FREE' : `₹${data.deliveryFee}`}
• *GST (5%):* ₹${data.taxAmount}
*Total Amount Paid:* ₹${data.finalAmount}

📍 *Kitchen:* Mirchi Chaats, Vysial Street, Town Hall, Coimbatore
_Thank you for ordering directly with Mirchi Chaats!_`;
}

export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${MIRCHI_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
