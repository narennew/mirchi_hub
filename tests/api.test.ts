import { describe, it, expect } from 'vitest';
import { GET as getMenu } from '../src/app/api/menu/route';
import { POST as validatePromo } from '../src/app/api/promos/validate/route';
import { POST as createOrder } from '../src/app/api/orders/route';

describe('API Route Handlers', () => {
  it('GET /api/menu returns categories and products', async () => {
    const req = new Request('http://localhost:3000/api/menu');
    const res = await getMenu(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.categories.length).toBeGreaterThan(0);
    expect(json.items.length).toBeGreaterThan(0);
  });

  it('POST /api/promos/validate validates valid coupon above min value', async () => {
    const req = new Request('http://localhost:3000/api/promos/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'WELCOME50', subtotal: 250 }),
    });
    const res = await validatePromo(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.discountAmount).toBe(50);
  });

  it('POST /api/promos/validate rejects coupon when subtotal is below minimum order value', async () => {
    const req = new Request('http://localhost:3000/api/promos/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'WELCOME50', subtotal: 100 }),
    });
    const res = await validatePromo(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain('Minimum order value');
  });

  it('POST /api/orders places order and enforces required fields', async () => {
    const badReq = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({ customerName: '' }),
    });
    const badRes = await createOrder(badReq);
    expect(badRes.status).toBe(400);

    const validReq = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'Meenakshi Sundaram',
        customerPhone: '+91 99440 22114',
        orderType: 'TAKEAWAY',
        items: [
          {
            menuItemId: 'item-masala-puri',
            quantity: 2,
            selectedSpice: 'Medium',
          },
        ],
        paymentMethod: 'COD',
      }),
    });
    const validRes = await createOrder(validReq);
    const validJson = await validRes.json();

    expect(validRes.status).toBe(200);
    expect(validJson.success).toBe(true);
    expect(validJson.order.orderNumber).toMatch(/^MC-2026-/);
    expect(validJson.order.finalAmount).toBeGreaterThan(0);
  });
});
