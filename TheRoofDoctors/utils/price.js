/**
 * Advanced Price Calculation Utility for Enterprise Roofing Quotes
 * Features:
 * - Base price calculation (metric/imperial)
 * - Multi-discount support (fixed, percentage, tiered)
 * - Tax rate support (local, federal, custom)
 * - Add-ons & extras (gutters, coatings, warranty, etc.)
 * - Currency conversion
 * - Quote breakdown (for UI/print/export)
 * - Validation & error handling
 * - Business logic hooks (CRM, analytics)
 */

// Supported currencies and conversion rates (could be dynamic via API)
const currencyRates = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.79,
  AUD: 1.5,
  CAD: 1.34,
};

export function convertCurrency(amount, from = 'USD', to = 'USD') {
  if (from === to) return amount;
  const usdAmount = amount / currencyRates[from];
  return usdAmount * currencyRates[to];
}

// Discount calculation
export function calculateDiscounts(base, discounts = []) {
  let discountTotal = 0;
  discounts.forEach(discount => {
    if (discount.type === 'fixed') {
      discountTotal += discount.value;
    } else if (discount.type === 'percent') {
      discountTotal += base * (discount.value / 100);
    } else if (discount.type === 'tiered') {
      // Example: [{min: 100, value: 5}, {min: 200, value: 10}]
      for (const t of discount.tiers) {
        if (base >= t.min) discountTotal += base * (t.value / 100);
      }
    }
  });
  return discountTotal;
}

// Tax calculation
export function calculateTaxes(subtotal, taxRates = []) {
  let taxTotal = 0;
  taxRates.forEach(rate => {
    taxTotal += subtotal * (rate.value / 100);
  });
  return taxTotal;
}

// Add-ons (extras)
export function calculateAddOns(addOns = []) {
  let addOnTotal = 0;
  addOns.forEach(addOn => {
    // addOn: {name, price, quantity}
    addOnTotal += (addOn.price || 0) * (addOn.quantity || 1);
  });
  return addOnTotal;
}

// Get discounts (simulate CRM/api)
export async function getDiscounts() {
  // Example: customer loyalty, promo, volume, etc.
  return [
    { type: 'percent', value: 10, label: 'Summer Promo' },
    { type: 'fixed', value: 50, label: 'Referral Bonus' }
  ];
}

// Get tax rates (simulate CRM/api)
export async function getTaxRates() {
  // Example: local tax, federal tax, environmental fees, etc.
  return [
    { value: 7.5, label: 'Sales Tax' },
    { value: 2, label: 'Environmental Fee' }
  ];
}

// Price calculation for a quote
export function calculatePriceDetails({
  area,       // {sqm, sqft}
  basePrice,  // per sqm or sqft
  discounts = [],
  taxRates = [],
  addOns = [],
  currency = 'USD',
  unit = 'sqm'
}) {
  // Area: {sqm, sqft}
  const areaValue = unit === 'sqm' ? area.sqm : area.sqft;
  let base = areaValue * basePrice;

  let addOnTotal = calculateAddOns(addOns);
  let subtotal = base + addOnTotal;
  let discountTotal = calculateDiscounts(subtotal, discounts);
  let subtotalAfterDiscount = subtotal - discountTotal;
  let taxTotal = calculateTaxes(subtotalAfterDiscount, taxRates);
  let total = subtotalAfterDiscount + taxTotal;

  // Currency conversion
  total = convertCurrency(total, 'USD', currency);
  base = convertCurrency(base, 'USD', currency);
  addOnTotal = convertCurrency(addOnTotal, 'USD', currency);
  discountTotal = convertCurrency(discountTotal, 'USD', currency);
  taxTotal = convertCurrency(taxTotal, 'USD', currency);

  return {
    base,
    addOnTotal,
    discountTotal,
    taxTotal,
    total,
    currency,
    unit,
    breakdown: {
      area: areaValue,
      basePrice,
      addOns,
      discounts,
      taxRates
    }
  };
}

// Format quote for display/export
export function formatQuoteDetails(details) {
  if (!details) return 'No quote details.';
  return (
    `Base: ${details.currency} $${details.base.toFixed(2)}\n` +
    (details.addOnTotal > 0 ? `Add-ons: $${details.addOnTotal.toFixed(2)}\n` : '') +
    (details.discountTotal > 0 ? `Discounts: -$${details.discountTotal.toFixed(2)}\n` : '') +
    (details.taxTotal > 0 ? `Tax: +$${details.taxTotal.toFixed(2)}\n` : '') +
    `Total: $${details.total.toFixed(2)}`
  );
}

// Validate quote logic
export function validateQuoteInput({ area, basePrice, currency }) {
  if (!area || area.sqm <= 0) return 'Area must be greater than zero.';
  if (!basePrice || basePrice <= 0) return 'Base price must be positive.';
  if (!currencyRates[currency]) return 'Unsupported currency.';
  return null;
}
