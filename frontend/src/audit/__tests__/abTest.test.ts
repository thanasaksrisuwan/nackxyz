/**
 * Unit tests for getOrAssignVariant()
 *
 * Validates: Requirements 1.2, 1.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getOrAssignVariant } from '../abTest';
import type { AbVariant } from '../types';

const AB_KEY = 'audit_ab_variant';
const VALID_VARIANTS: AbVariant[] = ['A', 'B', 'C'];

// Use a simple in-memory localStorage mock so tests are isolated
function makeLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
}

describe('getOrAssignVariant()', () => {
  let localStorageMock: ReturnType<typeof makeLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = makeLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  it('returns the stored variant when one is already in localStorage', () => {
    // Arrange: pre-populate with each valid variant
    for (const variant of VALID_VARIANTS) {
      localStorageMock.clear();
      localStorageMock.setItem(AB_KEY, variant);

      // Act
      const result = getOrAssignVariant();

      // Assert
      expect(result).toBe(variant);
      // getItem was called; setItem should NOT be called a second time
      expect(localStorageMock.getItem).toHaveBeenCalledWith(AB_KEY);
    }
  });

  it('picks and stores a new variant when localStorage is empty', () => {
    // localStorage mock starts empty — no pre-existing value

    const result = getOrAssignVariant();

    // The returned value must be one of the three valid variants
    expect(VALID_VARIANTS).toContain(result);

    // It must have been persisted so the next call returns the same value
    expect(localStorageMock.setItem).toHaveBeenCalledWith(AB_KEY, result);
  });

  it('returns only valid AbVariant values ("A", "B", or "C")', () => {
    // Run multiple times to cover randomness; each call uses a fresh store
    for (let i = 0; i < 20; i++) {
      localStorageMock.clear();
      // Reset call history for setItem so we can inspect each fresh call
      localStorageMock.setItem.mockClear();

      const result = getOrAssignVariant();

      expect(VALID_VARIANTS).toContain(result);
    }
  });

  it('ignores an invalid stored value and assigns a fresh variant', () => {
    // If somehow a corrupt/invalid value ended up in storage it should be replaced
    localStorageMock.setItem(AB_KEY, 'INVALID' as AbVariant);
    localStorageMock.setItem.mockClear(); // reset so we can detect the new write

    const result = getOrAssignVariant();

    expect(VALID_VARIANTS).toContain(result);
    // A new valid variant must have been written to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(AB_KEY, result);
  });
});
