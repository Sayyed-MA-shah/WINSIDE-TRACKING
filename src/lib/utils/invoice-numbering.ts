// Sequential invoice number generator with localStorage persistence
const INVOICE_COUNTER_KEY = 'winside_invoice_counter';
const STARTING_NUMBER = 321;

// Get current counter from localStorage or use starting number
function getCurrentCounter(): number {
  if (typeof window === 'undefined') return STARTING_NUMBER; // SSR safety
  
  const stored = localStorage.getItem(INVOICE_COUNTER_KEY);
  return stored ? parseInt(stored, 10) : STARTING_NUMBER;
}

// Save counter to localStorage
function saveCounter(number: number): void {
  if (typeof window === 'undefined') return; // SSR safety
  
  localStorage.setItem(INVOICE_COUNTER_KEY, number.toString());
}

export function getNextInvoiceNumber(): string {
  const currentNumber = getCurrentCounter();
  const invoiceNumber = `WIN-INV-${currentNumber}`;
  
  // Increment and save for next time
  saveCounter(currentNumber + 1);
  
  return invoiceNumber;
}

export function getCurrentInvoiceNumber(): number {
  return getCurrentCounter();
}

export function setInvoiceNumber(number: number): void {
  saveCounter(number);
}

export function resetInvoiceCounter(): void {
  saveCounter(STARTING_NUMBER);
}

// Preview next invoice number without incrementing
export function previewNextInvoiceNumber(): string {
  const currentNumber = getCurrentCounter();
  return `WIN-INV-${currentNumber}`;
}
