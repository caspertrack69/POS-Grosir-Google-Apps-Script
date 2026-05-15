import { useMemo } from "react";
import { calculateLineTotal } from "../utils/money";

export function resolveTierLevel(mitra) {
  return Number(mitra?.level_tier || 1);
}

export function getTierConfigByLevel(tierConfig, level) {
  return tierConfig.find((tier) => Number(tier.level) === Number(level)) || {
    level: 1,
    nama_tier: "Umum",
    diskon_persen: 0,
  };
}

export function calculateTierPricing(cartItems, mitra, tierConfig) {
  const tierLevel = resolveTierLevel(mitra);
  const activeTier = getTierConfigByLevel(tierConfig, tierLevel);

  const lines = cartItems.map((item) => {
    const pricing = calculateLineTotal(item.harga_dasar, item.qty, activeTier.diskon_persen);

    return {
      ...item,
      discountPercent: Number(activeTier.diskon_persen || 0),
      lineTotal: pricing.lineTotal,
      discountValue: pricing.discount,
      total: pricing.total,
    };
  });

  const subtotal = lines.reduce((acc, line) => acc + line.lineTotal, 0);
  const totalDiscount = lines.reduce((acc, line) => acc + line.discountValue, 0);
  const grandTotal = lines.reduce((acc, line) => acc + line.total, 0);

  return {
    tierLevel,
    activeTier,
    lines,
    subtotal,
    totalDiscount,
    grandTotal,
  };
}

export default function useTier(mitra, tierConfig) {
  return useMemo(() => calculateTierPricing([], mitra, tierConfig), [mitra, tierConfig]);
}
