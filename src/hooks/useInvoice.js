import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "grosirkit_invoice_history";

function loadInitialInvoices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function useInvoice() {
  const [invoices, setInvoices] = useState(loadInitialInvoices);
  const [activeInvoice, setActiveInvoice] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  }, [invoices]);

  const addInvoice = (invoicePayload) => {
    if (!invoicePayload?.id_invoice) {
      return;
    }

    setInvoices((current) => {
      const next = [invoicePayload, ...current.filter((item) => item.id_invoice !== invoicePayload.id_invoice)];
      return next.slice(0, 50);
    });

    setActiveInvoice(invoicePayload);
  };

  const value = useMemo(
    () => ({
      invoices,
      activeInvoice,
      addInvoice,
      setActiveInvoice,
    }),
    [activeInvoice, invoices],
  );

  return value;
}
