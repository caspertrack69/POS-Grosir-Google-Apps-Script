function pad(value, length = 4) {
  return String(value).padStart(length, "0");
}

export function generateNoInvoice(date = new Date(), sequence = 1) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `INV-${yyyy}${mm}${dd}-${pad(sequence)}`;
}

export function generateNoTransaksi(date = new Date(), sequence = 1) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `TRX-${yyyy}${mm}${dd}-${pad(sequence)}`;
}
