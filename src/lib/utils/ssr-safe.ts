// Utility function to generate consistent IDs and dates for SSR
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateConsistentDate(): Date {
  // Use a fixed date for initial data to avoid hydration issues
  return new Date('2025-01-01T00:00:00.000Z');
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function generateInvoiceNumber(): string {
  const timestamp = Date.now();
  return `INV-${timestamp}`;
}
