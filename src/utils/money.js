function percentToBasisPoints(percent) {
  return Math.round(Number(percent || 0) * 100);
}

function roundRatio(numerator, denominator) {
  const half = denominator / 2n;
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;

  return remainder >= half ? quotient + 1n : quotient;
}

export function applyDiscount(amount, discountPercent) {
  const safeAmount = Math.max(0, Number.isFinite(amount) ? amount : 0);
  const basisPoints = Math.max(0, percentToBasisPoints(discountPercent));

  const numerator = BigInt(safeAmount) * BigInt(basisPoints);
  const discount = Number(roundRatio(numerator, 10000n));

  return {
    discount,
    total: Math.max(0, safeAmount - discount),
  };
}

export function calculateLineTotal(unitPrice, qty, discountPercent) {
  const safeQty = Math.max(0, Number.isFinite(qty) ? qty : 0);
  const lineTotal = Math.max(0, Number(unitPrice || 0)) * safeQty;

  const { discount, total } = applyDiscount(lineTotal, discountPercent);

  return {
    lineTotal,
    discount,
    total,
  };
}

export function sumGrandTotal(lines) {
  return lines.reduce((accumulator, line) => accumulator + Number(line.total || 0), 0);
}
