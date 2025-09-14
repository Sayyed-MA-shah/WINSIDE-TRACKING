// Sequential PO number generator with localStorage persistence
const PO_COUNTER_KEY = 'winside_po_counter';
const STARTING_PO_NUMBER = 1001;

// Get current counter from localStorage or use starting number
function getCurrentPoCounter(): number {
  if (typeof window === 'undefined') return STARTING_PO_NUMBER; // SSR safety
  
  const stored = localStorage.getItem(PO_COUNTER_KEY);
  return stored ? parseInt(stored, 10) : STARTING_PO_NUMBER;
}

// Save counter to localStorage
function savePoCounter(number: number): void {
  if (typeof window === 'undefined') return; // SSR safety
  
  localStorage.setItem(PO_COUNTER_KEY, number.toString());
}

export function getNextPoNumber(): string {
  const currentNumber = getCurrentPoCounter();
  const poNumber = `PO-${currentNumber}`;
  
  // Increment and save for next time
  savePoCounter(currentNumber + 1);
  
  return poNumber;
}

export function getCurrentPoNumber(): number {
  return getCurrentPoCounter();
}

export function setPoNumber(number: number): void {
  savePoCounter(number);
}

export function resetPoCounter(): void {
  savePoCounter(STARTING_PO_NUMBER);
}

// Preview next PO number without incrementing
export function previewNextPoNumber(): string {
  const currentNumber = getCurrentPoCounter();
  return `PO-${currentNumber}`;
}