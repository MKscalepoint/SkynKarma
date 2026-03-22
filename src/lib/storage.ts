import { ChatSession, RoutineProduct, UserProfile, SavedProduct } from '@/types';

const KEYS = {
  SESSIONS: 'skynkarma_sessions',
  ROUTINE: 'skynkarma_routine',
  PROFILE: 'skynkarma_profile',
  ACTIVE_SESSION: 'skynkarma_active_session',
  SAVED_PRODUCTS: 'skynkarma_saved_products',
};

export function getSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEYS.SESSIONS) || '[]'); }
  catch { return []; }
}

export function saveSession(session: ChatSession): void {
  const sessions = getSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.unshift(session);
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions.slice(0, 20)));
}

export function deleteSession(id: string): void {
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(getSessions().filter(s => s.id !== id)));
}

export function getActiveSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEYS.ACTIVE_SESSION);
}

export function setActiveSessionId(id: string): void {
  localStorage.setItem(KEYS.ACTIVE_SESSION, id);
}

export function getRoutine(): RoutineProduct[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEYS.ROUTINE) || '[]'); }
  catch { return []; }
}

export function saveRoutine(routine: RoutineProduct[]): void {
  localStorage.setItem(KEYS.ROUTINE, JSON.stringify(routine));
}

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export function getSavedProducts(): SavedProduct[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEYS.SAVED_PRODUCTS) || '[]'); }
  catch { return []; }
}

export function saveSavedProducts(products: SavedProduct[]): void {
  localStorage.setItem(KEYS.SAVED_PRODUCTS, JSON.stringify(products));
}

export function addSavedProduct(product: Omit<SavedProduct, 'id' | 'savedAt'>): SavedProduct {
  const products = getSavedProducts();
  const newProduct: SavedProduct = {
    ...product,
    id: generateId(),
    savedAt: new Date().toISOString(),
  };
  // Avoid duplicates by name
  const exists = products.some(p => p.name.toLowerCase() === newProduct.name.toLowerCase());
  if (!exists) {
    products.unshift(newProduct);
    saveSavedProducts(products);
  }
  return newProduct;
}

export function removeSavedProduct(id: string): void {
  saveSavedProducts(getSavedProducts().filter(p => p.id !== id));
}

export function updateSavedProduct(id: string, updates: Partial<SavedProduct>): void {
  saveSavedProducts(getSavedProducts().map(p => p.id === id ? { ...p, ...updates } : p));
}

export function clearAll(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}