export interface ServiceAddress {
  address?: string;
  pincode?: string;
  locality?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

const STORAGE_KEY = 'serviceAddress';

export function saveServiceAddress(address: ServiceAddress): void {
  try {
    const clean = Object.fromEntries(
      Object.entries(address).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    // noop; surface errors to caller if needed
    throw e;
  }
}

export function getServiceAddress(): ServiceAddress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ServiceAddress;
  } catch {
    return null;
  }
}

export function clearServiceAddress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

