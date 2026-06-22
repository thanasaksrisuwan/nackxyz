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

// Use a simple in-memory sessionStorage mock so tests are isolated
function makeSessionStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
}

describe('getOrAssignVariant()', () => {
  let sessionStorageMock: ReturnType<typeof makeSessionStorageMock>;

  beforeEach(() => {
    sessionStorageMock = makeSessionStorageMock();
    vi.stubGlobal('sessionStorage', sessionStorageMock);
  });

  it('returns the stored variant when one is already in sessionStorage', () => {
    // Arrange: pre-populate with each valid variant
    for (const variant of VALID_VARIANTS) {
      sessionStorageMock.clear();
      sessionStorageMock.setItem(AB_KEY, variant);

      // Act
      const result = getOrAssignVariant();

      // Assert
      expect(result).toBe(variant);
      // getItem was called; setItem should NOT be called a second time
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith(AB_KEY);
    }
  });

  it('picks and stores a new variant when sessionStorage is empty', () => {
    // sessionStorage mock starts empty — no pre-existing value

    const result = getOrAssignVariant();

    // The returned value must be one of the three valid variants
    expect(VALID_VARIANTS).toContain(result);

    // It must have been persisted so the next call returns the same value
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(AB_KEY, result);
  });

  it('returns only valid AbVariant values ("A", "B", or "C")', () => {
    // Run multiple times to cover randomness; each call uses a fresh store
    for (let i = 0; i < 20; i++) {
      sessionStorageMock.clear();
      // Reset call history for setItem so we can inspect each fresh call
      sessionStorageMock.setItem.mockClear();

      const result = getOrAssignVariant();

      expect(VALID_VARIANTS).toContain(result);
    }
  });

  it('ignores an invalid stored value and assigns a fresh variant', () => {
    // If somehow a corrupt/invalid value ended up in storage it should be replaced
    sessionStorageMock.setItem(AB_KEY, 'INVALID' as AbVariant);
    sessionStorageMock.setItem.mockClear(); // reset so we can detect the new write

    const result = getOrAssignVariant();

    expect(VALID_VARIANTS).toContain(result);
    // A new valid variant must have been written to sessionStorage
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(AB_KEY, result);
  });
});
