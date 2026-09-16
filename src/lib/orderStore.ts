import { INITIAL_BOOKS } from '@/data/mockBooks';
import { Book, Order } from '@/types';

declare global {
  // eslint-disable-next-line no-var
  var __mockOrdersStore: Map<string, Order> | undefined;
}

if (!globalThis.__mockOrdersStore) {
  globalThis.__mockOrdersStore = new Map<string, Order>();
}

export const mockOrdersStore = globalThis.__mockOrdersStore;

export function saveOrderToStore(order: Order): void {
  mockOrdersStore.set(order.id, order);
}

export function getOrderFromStore(orderId: string): Order | undefined {
  return mockOrdersStore.get(orderId);
}

export function updateOrderStatusInStore(orderId: string, status: 'PENDING' | 'PAID'): Order | undefined {
  const order = mockOrdersStore.get(orderId);
  if (order) {
    order.status = status;
    order.updated_at = new Date().toISOString();
    mockOrdersStore.set(orderId, order);
    return order;
  }
  return undefined;
}

export function resolveBookForOrder(
  orderId?: string | null,
  bookId?: string | null,
  bookTitle?: string | null
): Book {
  // 1. Direct match by ID
  if (bookId) {
    const found = INITIAL_BOOKS.find((b) => b.id === bookId);
    if (found) return found;
  }

  // 2. Lookup in store if order exists
  if (orderId) {
    const stored = getOrderFromStore(orderId);
    if (stored?.book_id) {
      const found = INITIAL_BOOKS.find((b) => b.id === stored.book_id);
      if (found) return found;
    }
    const storedBook = stored?.book;
    if (storedBook && storedBook.id) {
      const found = INITIAL_BOOKS.find((b) => b.id === storedBook.id);
      if (found) return found;
    }

    // 3. Match by orderId prefix or substring
    const lowerOrderId = orderId.toLowerCase();
    if (lowerOrderId.includes('lab2') || lowerOrderId.includes('22222222')) {
      return INITIAL_BOOKS[1]; // Lab 2: Tarot App
    }
    if (lowerOrderId.includes('lab3') || lowerOrderId.includes('33333333')) {
      return INITIAL_BOOKS[2]; // Lab 3: Task Manager
    }
    if (lowerOrderId.includes('lab1') || lowerOrderId.includes('11111111')) {
      return INITIAL_BOOKS[0]; // Lab 1: Media Player
    }
  }

  // 4. Match by book title keywords
  if (bookTitle) {
    const lowerTitle = bookTitle.toLowerCase();
    if (lowerTitle.includes('tarot') || lowerTitle.includes('ทาโรต์') || lowerTitle.includes('ใบงานที่ 2')) {
      return INITIAL_BOOKS[1];
    }
    if (lowerTitle.includes('task') || lowerTitle.includes('sqlite') || lowerTitle.includes('ใบงานที่ 3')) {
      return INITIAL_BOOKS[2];
    }
    if (lowerTitle.includes('media') || lowerTitle.includes('pyqt') || lowerTitle.includes('ใบงานที่ 1')) {
      return INITIAL_BOOKS[0];
    }
  }

  // Default fallback
  return INITIAL_BOOKS[0];
}

export function generateMockOrderId(bookId: string): string {
  let labTag = 'lab1';
  if (bookId === '22222222-2222-2222-2222-222222222222') {
    labTag = 'lab2';
  } else if (bookId === '33333333-3333-3333-3333-333333333333') {
    labTag = 'lab3';
  }

  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `ord-${labTag}-${timestamp}-${random}`;
}
